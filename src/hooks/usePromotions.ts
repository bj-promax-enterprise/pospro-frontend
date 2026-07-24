import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as promotionsApi from "../api/promotions.api";
import type { CreatePromotionInput, UpdatePromotionInput } from "../api/promotions.api";

export function usePromotions(productId?: string) {
  return useQuery({
    queryKey: ["promotions", productId],
    queryFn: () => promotionsApi.listPromotions(productId),
    enabled: !!productId,
  });
}

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePromotionInput) => promotionsApi.createPromotion(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePromotionInput }) =>
      promotionsApi.updatePromotion(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
