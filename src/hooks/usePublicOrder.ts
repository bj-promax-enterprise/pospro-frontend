import { useMutation, useQuery } from "@tanstack/react-query";
import * as publicApi from "../api/public.api";
import type { SubmitPublicOrderInput } from "../api/public.api";

export function usePublicProducts(storeId: string) {
  return useQuery({
    queryKey: ["public-products", storeId],
    queryFn: () => publicApi.listPublicProducts(storeId),
    enabled: !!storeId,
  });
}

export function usePublicTables(storeId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["public-tables", storeId],
    queryFn: () => publicApi.listPublicTables(storeId),
    enabled: !!storeId && enabled,
  });
}

export function useSubmitPublicOrder(storeId: string) {
  return useMutation({
    mutationFn: (input: SubmitPublicOrderInput) => publicApi.submitPublicOrder(storeId, input),
  });
}

export function usePickupBoard(storeId: string) {
  return useQuery({
    queryKey: ["pickup-board", storeId],
    queryFn: () => publicApi.getPickupBoard(storeId),
    enabled: !!storeId,
    refetchInterval: 4000,
  });
}

export function usePublicOrderStatus(orderId: string | null) {
  return useQuery({
    queryKey: ["public-order-status", orderId],
    queryFn: () => publicApi.getPublicOrderStatus(orderId as string),
    enabled: !!orderId,
    refetchInterval: (query) => (query.state.data?.status === "COMPLETED" ? false : 4000),
  });
}

export function usePublicReceipt(orderId: string | null) {
  return useQuery({
    queryKey: ["public-receipt", orderId],
    queryFn: () => publicApi.getPublicReceipt(orderId as string),
    enabled: !!orderId,
  });
}

export function usePublicTableBill(storeId: string, label: string | null) {
  return useQuery({
    queryKey: ["public-table-bill", storeId, label],
    queryFn: () => publicApi.getPublicTableBill(storeId, label as string),
    enabled: !!storeId && !!label,
    retry: false,
  });
}
