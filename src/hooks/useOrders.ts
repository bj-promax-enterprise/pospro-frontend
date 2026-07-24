import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ordersApi from "../api/orders.api";
import type { CheckoutInput } from "../api/orders.api";

export function useOrders(params: ordersApi.OrderListParams, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersApi.listOrders(params),
    refetchInterval: options?.refetchInterval,
  });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersApi.getOrder(id as string),
    enabled: !!id,
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckoutInput) => ordersApi.checkout(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventory-logs"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}
