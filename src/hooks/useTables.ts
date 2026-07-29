import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as tablesApi from "../api/tables.api";
import type { PaymentMethod } from "../types";

export function useTables(storeId?: string) {
  return useQuery({ queryKey: ["tables", storeId], queryFn: () => tablesApi.listTables(storeId) });
}

export function useCreateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { storeId?: string; label: string }) => tablesApi.createTable(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
  });
}

export function useDeleteTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tablesApi.deleteTable(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
  });
}

export function useGetTableBill() {
  return useMutation({
    mutationFn: ({ label, storeId }: { label: string; storeId?: string }) =>
      tablesApi.getTableBill(label, storeId),
  });
}

export function useSettleTable() {
  return useMutation({
    mutationFn: ({ label, method, storeId }: { label: string; method: PaymentMethod; storeId?: string }) =>
      tablesApi.settleTable(label, method, storeId),
  });
}
