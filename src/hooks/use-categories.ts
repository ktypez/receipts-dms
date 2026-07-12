import { useState, useEffect, useCallback } from "react";
import type { Category, Subcategory } from "@/types";
import * as api from "@/lib/api";

function sortCats(list: Category[]): Category[] {
  return [...list].sort((a, b) => {
    const ao = (a as Category & { sort_order?: number }).sort_order ?? 0;
    const bo = (b as Category & { sort_order?: number }).sort_order ?? 0;
    if (ao !== bo) return ao - bo;
    return a.created_at.localeCompare(b.created_at);
  });
}

function sortSubs(list: Subcategory[]): Subcategory[] {
  return [...list].sort((a, b) => {
    const ao = (a as Subcategory & { sort_order?: number }).sort_order ?? 0;
    const bo = (b as Subcategory & { sort_order?: number }).sort_order ?? 0;
    if (ao !== bo) return ao - bo;
    return a.created_at.localeCompare(b.created_at);
  });
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Record<string, Subcategory[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCategories();
      setCategories(sortCats(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadSubcategories = useCallback(async (categoryId: string) => {
    try {
      const data = await api.getSubcategories(categoryId);
      setSubcategories((prev) => ({ ...prev, [categoryId]: sortSubs(data) }));
      return data;
    } catch {
      return [];
    }
  }, []);

  const create = useCallback(async (name: string) => {
    const cat = await api.createCategory(name);
    setCategories((prev) => [...prev, cat]);
    return cat;
  }, []);

  const update = useCallback(async (id: string, name: string) => {
    await api.updateCategory(id, name);
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setSubcategories((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const createSub = useCallback(
    async (categoryId: string, name: string) => {
      const sub = await api.createSubcategory(categoryId, name);
      setSubcategories((prev) => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] || []), sub],
      }));
      return sub;
    },
    []
  );

  const updateSub = useCallback(
    async (categoryId: string, subId: string, name: string) => {
      await api.updateSubcategory(categoryId, subId, name);
      setSubcategories((prev) => ({
        ...prev,
        [categoryId]: (prev[categoryId] || []).map((s) =>
          s.id === subId ? { ...s, name } : s
        ),
      }));
    },
    []
  );

  const removeSub = useCallback(async (categoryId: string, subId: string) => {
    await api.deleteSubcategory(categoryId, subId);
    setSubcategories((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter((s) => s.id !== subId),
    }));
  }, []);

  const reorderCats = useCallback(async (orderedIds: string[]) => {
    const prev = categories;
    setCategories(
      sortCats(
        orderedIds
          .map((id) => prev.find((c) => c.id === id))
          .filter((c): c is Category => Boolean(c))
      )
    );
    try {
      await api.reorderCategories(orderedIds);
    } catch (e) {
      load();
      throw e;
    }
  }, [categories, load]);

  const reorderSubs = useCallback(
    async (categoryId: string, orderedIds: string[]) => {
      const prev = subcategories[categoryId] || [];
      setSubcategories((prevState) => ({
        ...prevState,
        [categoryId]: sortSubs(
          orderedIds
            .map((id) => prev.find((s) => s.id === id))
            .filter((s): s is Subcategory => Boolean(s))
        ),
      }));
      try {
        await api.reorderSubcategories(categoryId, orderedIds);
      } catch (e) {
        loadSubcategories(categoryId);
        throw e;
      }
    },
    [subcategories, loadSubcategories]
  );

  const moveSub = useCallback(
    async (
      fromCategoryId: string,
      subId: string,
      toCategoryId: string,
      orderedIds: string[]
    ) => {
      const moving = (subcategories[fromCategoryId] || []).find(
        (s) => s.id === subId
      );
      if (!moving) return;
      setSubcategories((prevState) => {
        const from = (prevState[fromCategoryId] || []).filter(
          (s) => s.id !== subId
        );
        const targetSorted = orderedIds.filter((id) => id !== subId);
        const toList = sortSubs(
          targetSorted
            .map((id) => (prevState[toCategoryId] || []).find((s) => s.id === id))
            .filter((s): s is Subcategory => Boolean(s))
        );
        return {
          ...prevState,
          [fromCategoryId]: from,
          [toCategoryId]: [...toList, { ...moving, category_id: toCategoryId }],
        };
      });
      try {
        await api.moveSubcategory(
          fromCategoryId,
          subId,
          toCategoryId,
          orderedIds
        );
        await Promise.all([
          loadSubcategories(fromCategoryId),
          loadSubcategories(toCategoryId),
        ]);
      } catch (e) {
        loadSubcategories(fromCategoryId);
        loadSubcategories(toCategoryId);
        throw e;
      }
    },
    [subcategories, loadSubcategories]
  );

  return {
    categories,
    subcategories,
    loading,
    error,
    reload: load,
    loadSubcategories,
    create,
    update,
    remove,
    createSub,
    updateSub,
    removeSub,
    reorderCats,
    reorderSubs,
    moveSub,
  };
}
