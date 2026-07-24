import { apiClient } from "./client";
import type { Refund } from "../types";

export interface CreateRefundInput {
  orderId: string;
  items: { orderItemId: string; quantity: number }[];
  reason?: string;
}

export async function createRefund(input: CreateRefundInput): Promise<Refund> {
  const { data } = await apiClient.post<Refund>("/refunds", input);
  return data;
}

export async function listRefundsForOrder(orderId: string): Promise<Refund[]> {
  const { data } = await apiClient.get<{ items: Refund[] }>(`/refunds/${orderId}`);
  return data.items;
}
