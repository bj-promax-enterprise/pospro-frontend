import { apiClient } from "./client";
import type { PaymentMethod, Table } from "../types";

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

export interface TableBillItem {
  productNameSnapshot: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
}

export interface TableBill {
  tableLabel: string;
  orderCount: number;
  items: TableBillItem[];
  totalCents: number;
}

export async function getTableBill(label: string, storeId?: string): Promise<TableBill> {
  const { data } = await apiClient.get<TableBill>(`/tables/${encodeURIComponent(label)}/bill`, {
    params: storeId ? { storeId } : undefined,
  });
  return data;
}

export async function settleTable(
  label: string,
  method: PaymentMethod,
  storeId?: string
): Promise<{ tableLabel: string; settledOrders: number }> {
  const { data } = await apiClient.post<{ tableLabel: string; settledOrders: number }>(
    `/tables/${encodeURIComponent(label)}/settle`,
    { method },
    { params: storeId ? { storeId } : undefined }
  );
  return data;
}
