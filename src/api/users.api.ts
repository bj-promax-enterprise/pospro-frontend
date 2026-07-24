import { apiClient } from "./client";
import type { AppUser, Role } from "../types";

export async function listUsers(storeId?: string): Promise<AppUser[]> {
  const { data } = await apiClient.get<{ items: AppUser[] }>("/users", {
    params: storeId ? { storeId } : undefined,
  });
  return data.items;
}

export interface CreateUserInput {
  username: string;
  password: string;
  name: string;
  role: Role;
  storeId?: string | null;
}

export async function createUser(input: CreateUserInput): Promise<AppUser> {
  const { data } = await apiClient.post<AppUser>("/users", input);
  return data;
}

export interface UpdateUserInput {
  name?: string;
  role?: Role;
  storeId?: string | null;
  active?: boolean;
  password?: string;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AppUser> {
  const { data } = await apiClient.patch<AppUser>(`/users/${id}`, input);
  return data;
}
