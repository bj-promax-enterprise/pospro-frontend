import { apiClient } from "./client";
import type { InventoryItem, InventoryLog } from "../types";

export async function listInventory(storeId?: string): Promise<InventoryItem[]> {
  const { data } = await apiClient.get<{ items: InventoryItem[] }>("/inventory", {
    params: storeId ? { storeId } : undefined,
  });
  return data.items;
}

export async function listLowStock(storeId?: string): Promise<InventoryItem[]> {
  const { data } = await apiClient.get<{ items: InventoryItem[] }>("/inventory/low-stock", {
    params: storeId ? { storeId } : undefined,
  });
  return data.items;
}

export async function listInventoryLogs(params: {
  storeId?: string;
  productId?: string;
}): Promise<InventoryLog[]> {
  const { data } = await apiClient.get<{ items: InventoryLog[] }>("/inventory/logs", { params });
  return data.items;
}

export async function stockIn(input: {
  productId: string;
  storeId?: string;
  quantity: number;
  note?: string;
}) {
  const { data } = await apiClient.post("/inventory/stock-in", input);
  return data;
}

export async function adjustInventory(input: {
  productId: string;
  storeId?: string;
  quantityDelta: number;
  note?: string;
}) {
  const { data } = await apiClient.post("/inventory/adjust", input);
  return data;
}
