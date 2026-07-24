import { apiClient } from "./client";
import type { Table } from "../types";

export async function listTables(storeId?: string): Promise<Table[]> {
  const { data } = await apiClient.get<{ items: Table[] }>("/tables", {
    params: storeId ? { storeId } : undefined,
  });
  return data.items;
}

export async function createTable(input: { storeId?: string; label: string }): Promise<Table> {
  const { data } = await apiClient.post<Table>("/tables", input);
  return data;
}

export async function deleteTable(id: string): Promise<void> {
  await apiClient.delete(`/tables/${id}`);
}
