import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
	getUserProfile,
	loginUser,
	registerUser,
	setAuthToken,
} from "@/SERVICE/api";
import { RegisterInput, User } from "../types";

interface AuthState {
	user: User | null;
	token: string | null;
	setUser: (user: User | null) => void;
	isAuthenticated: () => boolean;
	isLoading: boolean;
	error: string | null;
	login: (email: string, password: string) => Promise<void>;
	register: (user: RegisterInput) => Promise<void>;
	logout: () => void;
	getProfile: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			token: null,
			isLoading: false,
			error: null,
			setUser: (user: User | null) => set({ user }),
			isAuthenticated: () => {
				const state = get() as AuthState;
				return !!(state.user && state.token);
			},
			login: async (email: string, password: string) => {
				set({ isLoading: true, error: null });
				try {
					const response = await loginUser(email, password);
					setAuthToken(response.token); // ✅ Set token for API calls
					set({
						user: response.user,
						token: response.token,
						isLoading: false,
					});
				} catch (error: unknown) {
					let errorMessage = "Login failed";
					if (error instanceof Error) errorMessage = error.message;
					set({
						isLoading: false,
						error: errorMessage,
						user: null,
						token: null,
					});
					throw error;
				}
			},
			register: async (userData: RegisterInput) => {
				set({ isLoading: true, error: null });
				try {
					const response = await registerUser(userData);
					setAuthToken(response.token); // ✅ Set token for API calls
					set({
						user: response.user,
						token: response.token,
						isLoading: false,
					});
				} catch (error: unknown) {
					let errorMessage = "Registration failed";
					if (error instanceof Error) errorMessage = error.message;
					set({
						isLoading: false,
						error: errorMessage,
						user: null,
						token: null,
					});
					throw error;
				}
			},
			getProfile: async (id: string) => {
				set({ isLoading: true, error: null });
				try {
					const response = await getUserProfile(id);
					set({
						user: response,
						isLoading: false,
					});
				} catch (error: unknown) {
					let errorMessage = "Profile fetch failed";
					if (error instanceof Error) errorMessage = error.message;
					set({
						isLoading: false,
						error: errorMessage,
					});
					throw error;
				}
			},
			logout: () => {
				setAuthToken(null); // ✅ Clear token from API
				set({
					user: null,
					token: null,
					error: null,
					isLoading: false,
				});
			},
		}),
		{
			name: "auth_store", // ✅ Storage key name
			storage: createJSONStorage(() => AsyncStorage), // ✅ Use AsyncStorage
			partialize: (state) => ({
				user: state.user,
				token: state.token,
			}), // ✅ Only persist user and token
		}
	)
);
