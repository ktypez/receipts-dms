import type { Receipt, Category, UploadResponse, ApiError } from "@/types";

const BASE = "/api";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(BASE + url, options);
  const text = await res.text();
  let data: T | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    return text as unknown as T;
  }
  if (!res.ok) {
    const msg = (data as unknown as ApiError)?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export async function getReceipts(params?: {
  category?: string;
  q?: string;
}): Promise<Receipt[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set("category", params.category);
  if (params?.q) search.set("q", params.q);
  const query = search.toString();
  return request<Receipt[]>(`/receipts${query ? "?" + query : ""}`);
}

export async function deleteReceipt(id: string): Promise<void> {
  await request(`/receipts/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function getFileUrl(id: string): Promise<string> {
  return `${BASE}/file/${id}`;
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export async function createCategory(name: string): Promise<Category> {
  return request<Category>("/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function updateCategory(
  id: string,
  name: string
): Promise<{ id: string; name: string }> {
  return request<{ id: string; name: string }>(
    `/categories/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }
  );
}

export async function deleteCategory(id: string): Promise<void> {
  await request(`/categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function uploadReceipt(
  file: File,
  category: string
): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("category", category);
  return request<UploadResponse>("/upload", {
    method: "POST",
    body: form,
  });
}
