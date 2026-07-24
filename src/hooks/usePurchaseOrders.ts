import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as poApi from "../api/purchaseOrders.api";
import type { CreatePurchaseOrderInput } from "../api/purchaseOrders.api";

export function usePurchaseOrders(status?: string) {
  return useQuery({
    queryKey: ["purchase-orders", status],
    queryFn: () => poApi.listPurchaseOrders(status),
  });
}

export function usePurchaseOrder(id: string | null) {
  return useQuery({
    queryKey: ["purchase-orders", "detail", id],
    queryFn: () => poApi.getPurchaseOrder(id as string),
    enabled: !!id,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["purchase-orders"] });
  qc.invalidateQueries({ queryKey: ["inventory"] });
  qc.invalidateQueries({ queryKey: ["inventory-logs"] });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePurchaseOrderInput) => poApi.createPurchaseOrder(input),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useReceivePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => poApi.receivePurchaseOrder(id),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useCancelPurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => poApi.cancelPurchaseOrder(id),
    onSuccess: () => invalidateAll(qc),
  });
}
