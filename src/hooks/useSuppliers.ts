import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as suppliersApi from "../api/suppliers.api";
import type { SupplierInput } from "../api/suppliers.api";

export function useSuppliers() {
  return useQuery({ queryKey: ["suppliers"], queryFn: suppliersApi.listSuppliers });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierInput) => suppliersApi.createSupplier(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SupplierInput> }) =>
      suppliersApi.updateSupplier(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}
