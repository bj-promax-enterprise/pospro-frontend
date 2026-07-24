import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as productsApi from "../api/products.api";
import type { ProductInput, ProductListParams } from "../api/products.api";

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productsApi.listProducts(params),
  });
}

export function useProductByBarcode() {
  return useMutation({
    mutationFn: (barcode: string) => productsApi.getProductByBarcode(barcode),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => productsApi.createProduct(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> & { active?: boolean } }) =>
      productsApi.updateProduct(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeactivateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.deactivateProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: (file: File) => productsApi.uploadProductImage(file),
  });
}
