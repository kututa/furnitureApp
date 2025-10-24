import { addTocart, getCart, updateCart as updateCartApi } from "@/SERVICE/api";
import { CartItem, Product } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CartState = {
	items: CartItem[];
	isLoading: boolean;
	error: string | null;
	userId: string | null;

	// basic ops
	addItem: (product: Product, qty?: number) => Promise<void>;
	setQuantity: (productId: string, qty: number) => void;
	removeItem: (productId: string) => void;
	clear: () => void;

	// server sync
	fetchCart: () => Promise<void>;
	setUserId: (userId: string | null) => void; // ✅ Add this line

	// derived
	subtotal: () => number;
};

function mapServerCartToItems(payload: any): CartItem[] {
	const list = payload?.cart?.items ?? payload?.items ?? [];
	return list
		.map((it: any) => {
			const p = it?.product || {};
			const product: Product = {
				id: String(p._id || p.id || ""),
				name: p.name || "",
				description: p.description || "",
				price: Number(p.price || 0),
				image: p.image || "",
				category: p.category || "",
				stock: Number(p.stock || 0),
			};
			return { product, quantity: Number(it?.quantity ?? 1) } as CartItem;
		})
		.filter((it: CartItem) => !!it.product.id);
}

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			items: [],
			isLoading: false,
			error: null,
			userId: null,

			addItem: async (product, qty = 1) => {
				// optimistic update
				set((state) => {
					const idx = state.items.findIndex((i) => i.product.id === product.id);
					if (idx > -1) {
						const next = [...state.items];
						next[idx] = {
							...next[idx],
							quantity: (next[idx].quantity || 0) + qty,
						};
						return { items: next };
					}
					return { items: [...state.items, { product, quantity: qty }] };
				});

				try {
					// Backend gets userId from JWT token automatically
					await addTocart({
						productId: product.id,
						quantity: qty,
					});
					console.log("✅ Product added to cart");
				} catch (err: any) {
					console.error("Failed to add to cart:", err);
					set({ error: err?.message || "Failed to add to cart" });
					throw err;
				}
			},

			setQuantity: (productId, qty) => {
				const nextQty = Math.max(1, qty);
				const prev = get().items;

				set({
					items: prev.map((i) =>
						i.product.id === productId ? { ...i, quantity: nextQty } : i
					),
				});

				updateCartApi(productId, nextQty).catch((err) => {
					console.error("Failed to update cart", err);
					set({
						items: prev,
						error: err instanceof Error ? err.message : "Failed to update cart",
					});
				});
			},

			removeItem: (productId) =>
				set((state) => ({
					items: state.items.filter((i) => i.product.id !== productId),
				})),

			clear: () => {
				set({ items: [] });
				console.log("🗑️ Cart cleared");
			},

			fetchCart: async () => {
				try {
					set({ isLoading: true, error: null });
					const data = await getCart();
					const items = mapServerCartToItems(data);
					set({ items, isLoading: false });
					console.log("✅ Cart fetched successfully");
				} catch (err: any) {
					console.error("Failed to fetch cart:", err);
					set({
						isLoading: false,
						items: [],
						error: err?.message || "Failed to fetch cart",
					});
				}
			},

			setUserId: (userId: string | null) => {
				set({ userId });
				console.log("✅ Cart userId set:", userId);
			},

			subtotal: () =>
				get().items.reduce(
					(sum, it) => sum + Number(it.product.price || 0) * (it.quantity || 1),
					0
				),
		}),
		{
			name: "cart_store",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (s) => ({ items: s.items, userId: s.userId }),
			version: 1,
		}
	)
);
