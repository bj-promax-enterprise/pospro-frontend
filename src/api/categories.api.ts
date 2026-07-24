import { apiClient } from "./client";
import type { Category } from "../types";

export async function listCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<{ items: Category[] }>("/categories");
  return data.items;
}

export async function createCategory(name: string): Promise<Category> {
  const { data } = await apiClient.post<Category>("/categories", { name });
  return data;
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, { name });
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
