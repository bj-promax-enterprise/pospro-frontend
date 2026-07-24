import { apiClient } from "./client";
import type { ActivePromotion, Order, PaymentMethod } from "../types";

export interface PublicProduct {
  id: string;
  name: string;
  unit: string;
  priceCents: number;
  imageUrl: string | null;
  activePromotion: ActivePromotion | null;
  category: { id: string; name: string } | null;
}

export interface PublicProductsResult {
  store: { id: string; name: string };
  items: PublicProduct[];
}

export async function listPublicProducts(storeId: string): Promise<PublicProductsResult> {
  const { data } = await apiClient.get<PublicProductsResult>(`/public/stores/${storeId}/products`);
  return data;
}

export interface SubmitPublicOrderInput {
  items: { productId: string; quantity: number }[];
  tableLabel?: string;
  discountCents?: number;
  payments: { method: PaymentMethod; amountCents: number }[];
}

export async function submitPublicOrder(storeId: string, input: SubmitPublicOrderInput): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/public/stores/${storeId}/orders`, input);
  return data;
}

export async function getLanInfo(): Promise<{ url: string }> {
  const { data } = await apiClient.get<{ url: string }>("/public/lan-info");
  return data;
}

export interface PickupBoardEntry {
  id: string;
  pickupNo: string | null;
  tableLabel: string | null;
}

export interface PickupBoardResult {
  preparing: PickupBoardEntry[];
  ready: PickupBoardEntry[];
}

export async function getPickupBoard(storeId: string): Promise<PickupBoardResult> {
  const { data } = await apiClient.get<PickupBoardResult>(`/public/stores/${storeId}/pickup-board`);
  return data;
}

export interface PublicOrderStatus {
  id: string;
  pickupNo: string | null;
  tableLabel: string | null;
  status: string;
  storeId: string;
}

export async function getPublicOrderStatus(orderId: string): Promise<PublicOrderStatus> {
  const { data } = await apiClient.get<PublicOrderStatus>(`/public/orders/${orderId}/status`);
  return data;
}
