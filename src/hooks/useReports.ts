import { useQuery } from "@tanstack/react-query";
import * as reportsApi from "../api/reports.api";
import type { ReportsQuery } from "../api/reports.api";

export function useRevenue(params: ReportsQuery) {
  return useQuery({
    queryKey: ["reports", "revenue", params],
    queryFn: () => reportsApi.getRevenue(params),
  });
}

export function useTopProducts(params: ReportsQuery) {
  return useQuery({
    queryKey: ["reports", "top-products", params],
    queryFn: () => reportsApi.getTopProducts(params),
  });
}

export function useReportsSummary(params: ReportsQuery) {
  return useQuery({
    queryKey: ["reports", "summary", params],
    queryFn: () => reportsApi.getSummary(params),
  });
}

export function usePeakHours(params: ReportsQuery) {
  return useQuery({
    queryKey: ["reports", "peak-hours", params],
    queryFn: () => reportsApi.getPeakHours(params),
  });
}

export function useStaffPerformance(params: ReportsQuery) {
  return useQuery({
    queryKey: ["reports", "staff-performance", params],
    queryFn: () => reportsApi.getStaffPerformance(params),
  });
}
