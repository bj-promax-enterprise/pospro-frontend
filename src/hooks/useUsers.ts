import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../api/users.api";
import type { CreateUserInput, UpdateUserInput } from "../api/users.api";

export function useUsers(storeId?: string) {
  return useQuery({ queryKey: ["users", storeId], queryFn: () => usersApi.listUsers(storeId) });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.createUser(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      usersApi.updateUser(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
