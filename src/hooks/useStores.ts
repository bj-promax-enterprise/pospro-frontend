import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as storesApi from "../api/stores.api";

export function useStores() {
  return useQuery({ queryKey: ["stores"], queryFn: storesApi.listStores });
}

export function useCreateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: storesApi.createStore,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name?: string; address?: string } }) =>
      storesApi.updateStore(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stores"] }),
  });
}
