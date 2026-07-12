import { useState, useEffect, useCallback } from "react";
import type { Category } from "@/types";
import * as api from "@/lib/api";

function sortCats(list: Category[]): Category[] {
  return [...list].sort((a, b) => {
    const ao = (a as Category & { sort_order?: number }).sort_order ?? 0;
    const bo = (b as Category & { sort_order?: number }).sort_order ?? 0;
    if (ao !== bo) return ao - bo;
    return a.created_at.localeCompare(b.created_at);
  });
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
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
  }, []);

  const reorderCats = useCallback(
    async (orderedIds: string[]) => {
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
    },
    [categories, load]
  );

  return {
    categories,
    loading,
    error,
    reload: load,
    create,
    update,
    remove,
    reorderCats,
  };
}
