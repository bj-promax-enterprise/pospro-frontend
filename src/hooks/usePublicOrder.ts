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
