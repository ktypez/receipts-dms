import { useState, useEffect, useCallback } from "react";
import type { Category, Subcategory } from "@/types";
import * as api from "@/lib/api";

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
      setCategories(data);
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
      setSubcategories((prev) => ({ ...prev, [categoryId]: data }));
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
  };
}
