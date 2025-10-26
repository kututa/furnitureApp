import { useOrderStore } from "@/stores/orderStore";
import { Order } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface OrderStatusButtonsProps {
	order: Order;
	userRole: "buyer" | "seller";
	onStatusUpdate?: (newStatus: string) => void;
}

const OrderStatusButtons: React.FC<OrderStatusButtonsProps> = ({
	order,
	userRole,
	onStatusUpdate,
}) => {
	const { updateOrderStatus, isLoading } = useOrderStore();
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

	const currentStatus = order.status?.toLowerCase() || "pending";

	// Define available status transitions based on current status and user role
	const getAvailableStatuses = () => {
		if (userRole === "buyer") {
			// Buyers can only cancel pending orders
			if (currentStatus === "pending") {
				return [
					{
						value: "cancelled",
						label: "Cancel Order",
						color: "#FF5722",
						icon: "close-circle",
					},
				];
			}
			return [];
		}

		// Seller status options
		switch (currentStatus) {
			case "pending":
				return [
					{
						value: "shipped",
						label: "Mark as Shipped",
						color: "#2196F3",
						icon: "airplane",
					},
					{
						value: "cancelled",
						label: "Cancel Order",
						color: "#FF5722",
						icon: "close-circle",
					},
				];
			case "shipped":
				return [
					{
						value: "delivered",
						label: "Mark as Delivered",
						color: "#4CAF50",
						icon: "checkmark-circle",
					},
				];
			case "delivered":
			case "cancelled":
				return []; // No status changes allowed
			default:
				return [];
		}
	};

	const availableStatuses = getAvailableStatuses();

	const handleStatusUpdate = async (newStatus: string) => {
		const statusLabels = {
			pending: "Pending",
			shipped: "Shipped",
			delivered: "Delivered",
			cancelled: "Cancelled",
		};

		Alert.alert(
			"Confirm Status Update",
			`Are you sure you want to change the order status to "${
				statusLabels[newStatus as keyof typeof statusLabels]
			}"?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Confirm",
					style: "default",
					onPress: async () => {
						try {
							setSelectedStatus(newStatus);
							await updateOrderStatus(order.id || order._id || "", newStatus);
							onStatusUpdate?.(newStatus);
							setShowStatusModal(false);

							Alert.alert(
								"Success",
								`Order status updated to ${
									statusLabels[newStatus as keyof typeof statusLabels]
								}.`
							);
						} catch (error: any) {
							Alert.alert(
								"Error",
								error?.message ||
									"Failed to update order status. Please try again."
							);
						} finally {
							setSelectedStatus(null);
						}
					},
				},
			]
		);
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return "#FFD600";
			case "shipped":
				return "#2196F3";
			case "delivered":
				return "#4CAF50";
			case "cancelled":
				return "#FF5722";
			default:
				return "#757575";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status.toLowerCase()) {
			case "pending":
				return "time";
			case "shipped":
				return "airplane";
			case "delivered":
				return "checkmark-circle";
			case "cancelled":
				return "close-circle";
			default:
				return "help-circle";
		}
	};

	if (availableStatuses.length === 0) {
		return null; 
	}

	return (
		<>
			{/* Current Status Display */}
			<View style={styles.currentStatusContainer}>
				<View
					style={[
						styles.statusBadge,
						{ backgroundColor: getStatusColor(currentStatus) },
					]}
				>
					<Ionicons
						name={getStatusIcon(currentStatus) as any}
						size={16}
						color="#fff"
						style={{ marginRight: 4 }}
					/>
					<Text style={styles.statusText}>{currentStatus.toUpperCase()}</Text>
				</View>
			</View>

			{/* Update Status Button */}
			<TouchableOpacity
				style={styles.updateButton}
				onPress={() => setShowStatusModal(true)}
				disabled={isLoading}
			>
				{isLoading && selectedStatus ? (
					<ActivityIndicator color="#fff" size="small" />
				) : (
					<>
						<Ionicons
							name="refresh"
							size={16}
							color="#fff"
							style={{ marginRight: 6 }}
						/>
						<Text style={styles.updateButtonText}>Update Status</Text>
					</>
				)}
			</TouchableOpacity>

			{/* Status Selection Modal */}
			<Modal
				visible={showStatusModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowStatusModal(false)}
			>
				<Pressable
					style={styles.modalOverlay}
					onPress={() => setShowStatusModal(false)}
				>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Update Order Status</Text>
						<Text style={styles.modalSubtitle}>
							Order: {order.orderNumber || `#${order.id?.slice(-6)}`}
						</Text>

						{availableStatuses.map((status) => (
							<TouchableOpacity
								key={status.value}
								style={[styles.statusOption, { borderColor: status.color }]}
								onPress={() => handleStatusUpdate(status.value)}
								disabled={isLoading}
							>
								<Ionicons
									name={status.icon as any}
									size={20}
									color={status.color}
									style={{ marginRight: 12 }}
								/>
								<Text
									style={[styles.statusOptionText, { color: status.color }]}
								>
									{status.label}
								</Text>
								{isLoading && selectedStatus === status.value && (
									<ActivityIndicator
										color={status.color}
										size="small"
										style={{ marginLeft: "auto" }}
									/>
								)}
							</TouchableOpacity>
						))}

						<TouchableOpacity
							style={styles.cancelButton}
							onPress={() => setShowStatusModal(false)}
						>
							<Text style={styles.cancelButtonText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</Pressable>
			</Modal>
		</>
	);
};

const styles = StyleSheet.create({
	currentStatusContainer: {
		marginBottom: 12,
		alignItems: "flex-start",
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	statusText: {
		fontSize: 12,
		fontWeight: "bold",
		color: "#fff",
	},
	updateButton: {
		backgroundColor: "#7CB798",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginTop: 8,
	},
	updateButtonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 14,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 24,
		width: "90%",
		maxWidth: 400,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#222",
		textAlign: "center",
		marginBottom: 8,
	},
	modalSubtitle: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		marginBottom: 24,
	},
	statusOption: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 10,
		borderWidth: 2,
		marginBottom: 12,
		backgroundColor: "#F8F9FA",
	},
	statusOptionText: {
		fontSize: 16,
		fontWeight: "600",
		flex: 1,
	},
	cancelButton: {
		paddingVertical: 12,
		alignItems: "center",
		marginTop: 8,
	},
	cancelButtonText: {
		color: "#666",
		fontSize: 16,
		fontWeight: "600",
	},
});

export default OrderStatusButtons;
