import { apiClient } from "./client";
import type { Product } from "../types";

export interface ProductListParams {
  search?: string;
  categoryId?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  const { data } = await apiClient.get<ProductListResult>("/products", { params });
  return data;
}

export async function getProductByBarcode(barcode: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/barcode/${encodeURIComponent(barcode)}`);
  return data;
}

export interface ProductInput {
  sku: string;
  barcode?: string | null;
  name: string;
  unit: string;
  priceCents: number;
  costCents: number;
  categoryId?: string | null;
  imageUrl?: string | null;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await apiClient.post<Product>("/products", input);
  return data;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput> & { active?: boolean }
): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, input);
  return data;
}

export async function deactivateProduct(id: string): Promise<Product> {
  const { data } = await apiClient.delete<Product>(`/products/${id}`);
  return data;
}

export async function uploadProductImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await apiClient.post<{ url: string }>("/products/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
