import { apiClient } from "./client";
import type { PurchaseOrder } from "../types";

export async function listPurchaseOrders(status?: string): Promise<PurchaseOrder[]> {
  const { data } = await apiClient.get<{ items: PurchaseOrder[] }>("/purchase-orders", {
    params: status ? { status } : undefined,
  });
  return data.items;
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const { data } = await apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`);
  return data;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  storeId?: string;
  note?: string;
  items: { productId: string; quantity: number; unitCostCents: number }[];
}

export async function createPurchaseOrder(input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
  const { data } = await apiClient.post<PurchaseOrder>("/purchase-orders", input);
  return data;
}

export async function receivePurchaseOrder(id: string): Promise<PurchaseOrder> {
  const { data } = await apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/receive`);
  return data;
}

export async function cancelPurchaseOrder(id: string): Promise<PurchaseOrder> {
  const { data } = await apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/cancel`);
  return data;
}
