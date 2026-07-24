import { apiClient } from "./client";
import type { Promotion, PromotionDiscountType } from "../types";

export async function listPromotions(productId?: string): Promise<Promotion[]> {
  const { data } = await apiClient.get<{ items: Promotion[] }>("/promotions", {
    params: productId ? { productId } : undefined,
  });
  return data.items;
}

export interface CreatePromotionInput {
  productId: string;
  discountType: PromotionDiscountType;
  value: number;
  startAt?: string | null;
  endAt?: string | null;
}

export async function createPromotion(input: CreatePromotionInput): Promise<Promotion> {
  const { data } = await apiClient.post<Promotion>("/promotions", input);
  return data;
}

export interface UpdatePromotionInput {
  active?: boolean;
  value?: number;
  startAt?: string | null;
  endAt?: string | null;
}

export async function updatePromotion(id: string, input: UpdatePromotionInput): Promise<Promotion> {
  const { data } = await apiClient.patch<Promotion>(`/promotions/${id}`, input);
  return data;
}
