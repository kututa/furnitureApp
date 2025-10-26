import { useCartStore } from "@/stores/cartStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
	FlatList,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export type CartItem = {
	id: string;
	name: string;
	price: string;
	image: any;
	quantity: number;
};

type CartProps = {
	onBack?: () => void;
	onCheckout?: () => void;
	onUpdateQuantity?: (id: string, quantity: number) => void;
};

const SHIPPING_COST = 100;

const Cart: React.FC<CartProps> = ({
	onBack,
	onCheckout,
	onUpdateQuantity,
}) => {
	const { items, setQuantity, removeItem, subtotal } = useCartStore();

	// Map store items -> UI CartItem shape
	const uiItems: CartItem[] = useMemo(() => {
		return items.map((it) => ({
			id: it.product.id,
			name: it.product.name,
			price: `Ksh ${Number(it.product.price || 0)}`,
			image: it.product.image ? { uri: it.product.image } : undefined,
			quantity: it.quantity,
		}));
	}, [items]);

	const subtotalValue = subtotal();
	const total = subtotalValue + SHIPPING_COST;

	const handleSetQuantity = (id: string, nextQty: number) => {
		if (onUpdateQuantity) {
			onUpdateQuantity(id, nextQty);
			return;
		}
		if (nextQty <= 0) {
			removeItem(id).catch((err) => console.error("Failed to remove item:", err));
		} else {
			setQuantity(id, nextQty);
		}
	};

	return (
		<View style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Header */}
				<View style={styles.headerRow}>
					<TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
						<Ionicons name="arrow-back" size={24} color="#222" />
					</TouchableOpacity>
					<Text style={styles.header}>Cart</Text>
					<View style={{ width: 24 }} />
				</View>

				{/* Empty state */}
				{uiItems.length === 0 ? (
					<View style={{ paddingVertical: 40, alignItems: "center" }}>
						<Ionicons name="cart-outline" size={64} color="#7CB798" />
						<Text style={{ color: "#7CB798", marginTop: 12 }}>
							Your cart is empty
						</Text>
					</View>
				) : (
					<>
						{/* Cart Items */}
						<FlatList
							data={uiItems}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<View style={styles.cartItemRow}>
									{item.image ? (
										<Image source={item.image} style={styles.cartItemImage} />
									) : (
										<View
											style={[
												styles.cartItemImage,
												{ backgroundColor: "#eee" },
											]}
										/>
									)}
									<View style={{ flex: 1 }}>
										<Text style={styles.cartItemName}>{item.name}</Text>
										<Text style={styles.cartItemPrice}>{item.price}</Text>
									</View>
									<View style={styles.quantityBox}>
										<TouchableOpacity
											onPress={() =>
												handleSetQuantity(item.id, item.quantity - 1)
											}
										>
											<Text style={styles.quantityBtn}>-</Text>
										</TouchableOpacity>
										<Text style={styles.quantityText}>{item.quantity}</Text>
										<TouchableOpacity
											onPress={() =>
												handleSetQuantity(item.id, item.quantity + 1)
											}
										>
											<Text style={styles.quantityBtn}>+</Text>
										</TouchableOpacity>
									</View>
								</View>
							)}
							scrollEnabled={false}
						/>

						{/* Summary */}
						<Text style={styles.summaryTitle}>Summary</Text>
						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Subtotal</Text>
							<Text style={styles.summaryValue}>Ksh {subtotalValue}</Text>
						</View>
						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Shipping</Text>
							<Text style={styles.summaryValue}>Ksh {SHIPPING_COST}</Text>
						</View>
						<View style={styles.summaryRow}>
							<Text style={styles.summaryLabel}>Total</Text>
							<Text style={styles.summaryValue}>Ksh {total}</Text>
						</View>

						{/* Checkout Button */}
						<TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
							<Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
						</TouchableOpacity>
					</>
				)}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#F8FCF9" },
	scrollContent: { padding: 24, paddingBottom: 120 },
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 16,
		marginTop: 28,
	},
	header: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#222",
		textAlign: "center",
	},
	cartItemRow: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 12,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: "#E7F3EC",
	},
	cartItemImage: {
		width: 48,
		height: 48,
		borderRadius: 8,
		marginRight: 12,
		backgroundColor: "#eee",
	},
	cartItemName: {
		fontSize: 15,
		fontWeight: "bold",
		color: "#222",
		marginBottom: 2,
	},
	cartItemPrice: { color: "#7CB798", fontSize: 14 },
	quantityBox: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F3F8F5",
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
		minWidth: 70,
		justifyContent: "space-between",
	},
	quantityBtn: { color: "#7CB798", fontSize: 22, fontWeight: "bold" },
	quantityText: { fontSize: 16, fontWeight: "bold", color: "#222" },
	summaryTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#222",
		marginTop: 12,
		marginBottom: 8,
	},
	summaryRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	summaryLabel: { color: "#7CB798", fontSize: 15 },
	summaryValue: { fontSize: 15, fontWeight: "bold", color: "#222" },
	checkoutBtn: {
		backgroundColor: "#38E472",
		borderRadius: 10,
		paddingVertical: 16,
		alignItems: "center",
		marginTop: 16,
		elevation: 3,
	},
	checkoutBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default Cart;
