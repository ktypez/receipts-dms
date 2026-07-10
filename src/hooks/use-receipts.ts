import { useState, useEffect, useCallback } from "react";
import type { Receipt } from "@/types";
import * as api from "@/lib/api";

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getReceipts();
      setReceipts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = useCallback(
    async (id: string) => {
      await api.deleteReceipt(id);
      setReceipts((prev) => prev.filter((r) => r.id !== id));
    },
    []
  );

  return { receipts, loading, error, reload: load, remove };
}
