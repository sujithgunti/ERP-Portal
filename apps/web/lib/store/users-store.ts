import { create } from 'zustand';
import { prismaApi, ApiError } from '@/lib/api';
import type { UserRow, CreateUserDto, UpdateUserDto, CredentialResult } from '@/lib/types';

/**
 * Users / role-management store (Zustand). ALL `/users` API calls live here.
 * `create` and `resetPassword` return the one-time plaintext password so the
 * page can show it once.
 */

interface UsersState {
  users: UserRow[];
  loading: boolean;
  loaded: boolean;

  fetchUsers: (force?: boolean) => Promise<void>;
  createUser: (dto: CreateUserDto) => Promise<CredentialResult>;
  updateUser: (id: string, dto: UpdateUserDto) => Promise<void>;
  updateTabs: (id: string, tabs: number) => Promise<void>;
  resetPassword: (id: string, password: string) => Promise<CredentialResult>;
  removeUser: (id: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  loaded: false,

  fetchUsers: async (force = false) => {
    if (get().loaded && !force) return;
    set({ loading: true });
    try {
      const users = await prismaApi<UserRow[]>('GET', '/users');
      set({ users, loaded: true });
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) set({ users: [] });
    } finally {
      set({ loading: false });
    }
  },

  createUser: async (dto) => {
    const res = await prismaApi<CredentialResult>('POST', '/users', dto);
    await get().fetchUsers(true);
    return res;
  },

  updateUser: async (id, dto) => {
    await prismaApi('PATCH', `/users/${id}`, dto);
    await get().fetchUsers(true);
  },

  updateTabs: async (id, tabs) => {
    await prismaApi('PATCH', `/users/${id}/tabs`, { tabs });
    await get().fetchUsers(true);
  },

  resetPassword: async (id, password) => {
    return prismaApi<CredentialResult>('POST', `/users/${id}/reset-password`, { password });
  },

  removeUser: async (id) => {
    await prismaApi('DELETE', `/users/${id}`);
    await get().fetchUsers(true);
  },
}));
