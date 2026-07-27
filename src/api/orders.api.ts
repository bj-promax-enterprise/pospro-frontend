import { apiClient } from "./client";
import type { Order, PaymentMethod } from "../types";

export interface CheckoutItem {
  productId: string;
  quantity: number;
  discountCents?: number;
}

export interface CheckoutPayment {
  method: PaymentMethod;
  amountCents: number;
}

export interface CheckoutInput {
  storeId?: string;
  source?: "POS" | "DELIVERY";
  deliveryAddress?: string;
  deliveryPhone?: string;
  memberId?: string;
  pointsToRedeem?: number;
  couponId?: string;
  items: CheckoutItem[];
  discountCents?: number;
  taxCents?: number;
  payments: CheckoutPayment[];
}

export async function checkout(input: CheckoutInput): Promise<Order> {
  const { data } = await apiClient.post<Order>("/orders", input);
  return data;
}

export interface OrderListParams {
  from?: string;
  to?: string;
  status?: string;
  source?: string;
  storeId?: string;
  page?: number;
  pageSize?: number;
}

export interface OrderListResult {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listOrders(params: OrderListParams = {}): Promise<OrderListResult> {
  const { data } = await apiClient.get<OrderListResult>("/orders", { params });
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const { data } = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
  return data;
}
