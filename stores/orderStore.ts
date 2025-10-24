import { getOrder, order } from "@/SERVICE/api";
import { Order, makeOrder } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OrderState {
	orders: Order[];
	currentOrder: Order | null;
	isLoading: boolean;
	error: string | null;

	// Create order
	createOrder: (orderData: makeOrder) => Promise<Order>;

	// Fetch orders (for seller/buyer)
	fetchOrders: (userId: string) => Promise<void>;

	// Update order status
	updateOrderStatus: (orderId: string, status: Order["paymentStatus"]) => void;

	// Clear orders
	clearOrders: () => void;

	// Set current order
	setCurrentOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderState>()(
	persist(
		(set, get) => ({
			orders: [],
			currentOrder: null,
			isLoading: false,
			error: null,

			createOrder: async (orderData: makeOrder) => {
				set({ isLoading: true, error: null });
				try {
					console.log("📦 Creating order:", orderData);
					const response = await order(orderData);

					if (response.success) {
						const newOrder = response.order;

						// Add to orders list
						set((state) => ({
							orders: [newOrder, ...state.orders],
							currentOrder: newOrder,
							isLoading: false,
						}));

						console.log("✅ Order created successfully:", newOrder.id);
						return newOrder;
					} else {
						throw new Error(response.message || "Failed to create order");
					}
				} catch (err: any) {
					console.error("❌ Failed to create order:", err);
					const errorMessage = err?.message || "Failed to create order";
					set({
						error: errorMessage,
						isLoading: false,
					});
					throw new Error(errorMessage);
				}
			},

			fetchOrders: async (userId: string) => {
				set({ isLoading: true, error: null });
				try {
					console.log("📋 Fetching orders for user:", userId);
					const response = await getOrder(userId);

					const ordersArray = response?.orders || [];

					set({
						orders: ordersArray,
						isLoading: false,
					});

					console.log(`✅ Fetched ${ordersArray.length} orders`);
				} catch (err: any) {
					console.error("❌ Failed to fetch orders:", err);
					set({
						orders: [],
						error: err?.message || "Failed to fetch orders",
						isLoading: false,
					});
				}
			},

			updateOrderStatus: (orderId: string, status: Order["paymentStatus"]) => {
				set((state) => ({
					orders: state.orders.map((order) =>
						order.id === orderId || order._id === orderId
							? { ...order, paymentStatus: status }
							: order
					),
					currentOrder:
						state.currentOrder?.id === orderId ||
						state.currentOrder?._id === orderId
							? { ...state.currentOrder, paymentStatus: status }
							: state.currentOrder,
				}));
				console.log(`✅ Order ${orderId} status updated to ${status}`);
			},

			clearOrders: () => {
				set({ orders: [], currentOrder: null, error: null });
				console.log("🗑️ Orders cleared");
			},

			setCurrentOrder: (order: Order | null) => {
				set({ currentOrder: order });
				console.log("📌 Current order set:", order?.id);
			},
		}),
		{
			name: "order_store",
			storage: createJSONStorage(() => AsyncStorage),
			partialize: (state) => ({
				orders: state.orders,
				currentOrder: state.currentOrder,
			}),
			version: 1,
		}
	)
);
