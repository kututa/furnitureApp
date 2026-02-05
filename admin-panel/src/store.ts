import { create } from "zustand";
import {
    approveUser,
    deleteUser,
    fetchUsers,
    suspendUser,
} from "./api";

export type AdminUser = {
  _id: string;
  fullName?: string;
  email: string;
  role: "buyer" | "seller" | string;
  isApproved?: boolean;
  isSuspended?: boolean;
};

type AdminState = {
  users: AdminUser[];
  isLoading: boolean;
  error: string | null;
  loadUsers: () => Promise<void>;
  approve: (id: string) => Promise<void>;
  suspend: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  loadUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await fetchUsers();
      set({ users: data || [], isLoading: false });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to fetch users";
      set({ isLoading: false, error: errorMsg });
      console.error("Failed to fetch users:", err);
    }
  },

  approve: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await approveUser(id);
      const users = get().users.map((u) => (u._id === id ? data : u));
      set({ users, isLoading: false });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to approve user";
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  suspend: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await suspendUser(id);
      const users = get().users.map((u) => (u._id === id ? data : u));
      set({ users, isLoading: false });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to suspend user";
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  remove: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteUser(id);
      const users = get().users.filter((u) => u._id !== id);
      set({ users, isLoading: false });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to delete user";
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
}));
