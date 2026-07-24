import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as inventoryApi from "../api/inventory.api";

export function useInventory(storeId?: string) {
  return useQuery({
    queryKey: ["inventory", storeId],
    queryFn: () => inventoryApi.listInventory(storeId),
  });
}

export function useLowStock(storeId?: string) {
  return useQuery({
    queryKey: ["inventory", "low-stock", storeId],
    queryFn: () => inventoryApi.listLowStock(storeId),
  });
}

export function useInventoryLogs(params: { storeId?: string; productId?: string }) {
  return useQuery({
    queryKey: ["inventory-logs", params],
    queryFn: () => inventoryApi.listInventoryLogs(params),
  });
}

export function useStockIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.stockIn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventory-logs"] });
    },
  });
}
