import { useAuthStore } from "@/stores/authStore";
import { useOrderStore } from "@/stores/orderStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type BuyerOrdersProps = {
	onBack?: () => void;
};

const BuyerOrders: React.FC<BuyerOrdersProps> = ({ onBack }) => {
	const { user } = useAuthStore();
	const { orders, fetchOrders, isLoading } = useOrderStore();

	useEffect(() => {
		if (user?.id) {
			fetchOrders(user.id);
		}
	}, [user?.id]);

	const renderOrder = ({ item }: any) => {
		const statusColor =
			({
				pending: "#FFA500",
				paid: "#38E472",
				failed: "#E47272",
				cancelled: "#999",
				timeout: "#999",
			} as Record<string, string>)[item.paymentStatus] || "#999";

		return (
			<View style={styles.orderCard}>
				<View style={styles.orderHeader}>
					<Text style={styles.orderNumber}>Order #{item.id || item._id}</Text>
					<View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
						<Text style={styles.statusText}>{item.paymentStatus}</Text>
					</View>
				</View>

				<Text style={styles.orderDate}>
					{new Date(item.createdAt).toLocaleDateString("en-KE", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</Text>

				<View style={styles.orderDetails}>
					<Text style={styles.detailLabel}>Total Amount:</Text>
					<Text style={styles.detailValue}>KES {item.totalAmount}</Text>
				</View>

				<View style={styles.orderDetails}>
					<Text style={styles.detailLabel}>Payment Method:</Text>
					<Text style={styles.detailValue}>{item.paymentMethod}</Text>
				</View>

				{item.mpesaReceiptNumber && (
					<View style={styles.orderDetails}>
						<Text style={styles.detailLabel}>M-Pesa Receipt:</Text>
						<Text style={styles.detailValue}>{item.mpesaReceiptNumber}</Text>
					</View>
				)}

				<Text style={styles.itemsCount}>
					{item.products?.length || 0} item(s)
				</Text>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.headerRow}>
				<TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
					<Ionicons name="arrow-back" size={24} color="#222" />
				</TouchableOpacity>
				<Text style={styles.header}>My Orders</Text>
				<View style={{ width: 24 }} />
			</View>

			{isLoading ? (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color="#38E472" />
					<Text style={styles.loadingText}>Loading orders...</Text>
				</View>
			) : orders.length === 0 ? (
				<View style={styles.centerContainer}>
					<Ionicons name="receipt-outline" size={64} color="#E7F3EC" />
					<Text style={styles.emptyText}>No orders yet</Text>
					<Text style={styles.emptySubtext}>
						Your orders will appear here once you make a purchase
					</Text>
				</View>
			) : (
				<FlatList
					data={orders}
					renderItem={renderOrder}
					keyExtractor={(item, index) => item.id || item._id || `order-${index}`}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8FCF9",
		padding: 24,
	},
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
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		color: "#7CB798",
		marginTop: 12,
		fontSize: 16,
	},
	emptyText: {
		color: "#222",
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 16,
	},
	emptySubtext: {
		color: "#7CB798",
		fontSize: 14,
		marginTop: 8,
		textAlign: "center",
		paddingHorizontal: 32,
	},
	listContent: {
		paddingBottom: 24,
	},
	orderCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#E7F3EC",
	},
	orderHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	orderNumber: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#222",
	},
	statusBadge: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "bold",
		textTransform: "capitalize",
	},
	orderDate: {
		color: "#7CB798",
		fontSize: 14,
		marginBottom: 12,
	},
	orderDetails: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 6,
	},
	detailLabel: {
		color: "#7CB798",
		fontSize: 14,
	},
	detailValue: {
		color: "#222",
		fontSize: 14,
		fontWeight: "500",
	},
	itemsCount: {
		color: "#7CB798",
		fontSize: 13,
		marginTop: 8,
		fontStyle: "italic",
	},
});

export default BuyerOrders;
