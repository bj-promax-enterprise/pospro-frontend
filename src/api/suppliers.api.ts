import { apiClient } from "./client";
import type { Supplier } from "../types";

export async function listSuppliers(): Promise<Supplier[]> {
  const { data } = await apiClient.get<{ items: Supplier[] }>("/suppliers");
  return data.items;
}

export interface SupplierInput {
  name: string;
  contact?: string | null;
  phone?: string | null;
  address?: string | null;
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const { data } = await apiClient.post<Supplier>("/suppliers", input);
  return data;
}

export async function updateSupplier(id: string, input: Partial<SupplierInput>): Promise<Supplier> {
  const { data } = await apiClient.patch<Supplier>(`/suppliers/${id}`, input);
  return data;
}
