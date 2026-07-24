import { apiClient } from "./client";
import type { Store } from "../types";

export async function listStores(): Promise<Store[]> {
  const { data } = await apiClient.get<{ items: Store[] }>("/stores");
  return data.items;
}

export async function createStore(input: { name: string; address?: string }): Promise<Store> {
  const { data } = await apiClient.post<Store>("/stores", input);
  return data;
}

export async function updateStore(
  id: string,
  input: { name?: string; address?: string }
): Promise<Store> {
  const { data } = await apiClient.patch<Store>(`/stores/${id}`, input);
  return data;
}
