import { apiClient } from "./client";

export interface RevenuePoint {
  date: string;
  revenueCents: number;
  orderCount: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  quantitySold: number;
  revenueCents: number;
}

export interface ReportsSummary {
  totalRevenueCents: number;
  totalOrders: number;
  totalRefundsCents: number;
  avgOrderValueCents: number;
}

export interface PeakHourPoint {
  hour: number;
  orderCount: number;
  revenueCents: number;
}

export interface StaffPerformance {
  userId: string | null;
  userName: string | null;
  orderCount: number;
  revenueCents: number;
  avgOrderValueCents: number;
}

export interface ReportsQuery {
  period?: "daily" | "weekly" | "monthly";
  from?: string;
  to?: string;
  storeId?: string;
  limit?: number;
}

export async function getRevenue(params: ReportsQuery): Promise<RevenuePoint[]> {
  const { data } = await apiClient.get<{ items: RevenuePoint[] }>("/reports/revenue", { params });
  return data.items;
}

export async function getTopProducts(params: ReportsQuery): Promise<TopProduct[]> {
  const { data } = await apiClient.get<{ items: TopProduct[] }>("/reports/top-products", { params });
  return data.items;
}

export async function getSummary(params: ReportsQuery): Promise<ReportsSummary> {
  const { data } = await apiClient.get<ReportsSummary>("/reports/summary", { params });
  return data;
}

export async function getPeakHours(params: ReportsQuery): Promise<PeakHourPoint[]> {
  const { data } = await apiClient.get<{ items: PeakHourPoint[] }>("/reports/peak-hours", { params });
  return data.items;
}

export async function getStaffPerformance(params: ReportsQuery): Promise<StaffPerformance[]> {
  const { data } = await apiClient.get<{ items: StaffPerformance[] }>("/reports/staff-performance", {
    params,
  });
  return data.items;
}
