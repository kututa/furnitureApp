import { useAuthStore } from "@/stores/authStore";
import { useProductStore } from "@/stores/productStore";
import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
	ActivityIndicator,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type SellerManageListingProps = {
	onClose: () => void;
};

const SellerManageListing = ({ onClose }: SellerManageListingProps) => {
	const { user } = useAuthStore();
	const { fetchSellersListings, products, isLoading } = useProductStore();
	const sellerId = user?.id;

	useEffect(() => {
		console.log("User object:", user); // Debug log
		
		console.log("Seller ID:", sellerId); // Debug log

		if (sellerId) {
			fetchSellersListings(sellerId);
		} else {
			console.error("No seller ID found - user might not be logged in");
		}
	}, [sellerId, fetchSellersListings]);

	if (isLoading) {
		return (
			<View
				style={[
					styles.container,
					{ justifyContent: "center", alignItems: "center" },
				]}
			>
				<ActivityIndicator size="large" color="#38E472" />
				<Text style={{ color: "#fff", marginTop: 12 }}>
					Loading your listings...
				</Text>
			</View>
		);
	}

	if (!sellerId) {
		return (
			<View
				style={[
					styles.container,
					{ justifyContent: "center", alignItems: "center" },
				]}
			>
				<Text style={{ color: "#B6E2C6", fontSize: 16 }}>
					Authentication required
				</Text>
				<Text style={{ color: "#7CB798", fontSize: 14, marginTop: 8 }}>
					Please log in again
				</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.headerRow}>
				<TouchableOpacity style={{ padding: 4 }} onPress={onClose}>
					<Ionicons name="close" size={28} color="#fff" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Manage Listings</Text>
				<View style={{ width: 28 }} />
			</View>

			{products.length === 0 ? (
				<View
					style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
				>
					<Text style={{ color: "#B6E2C6", fontSize: 16 }}>
						No listings yet
					</Text>
					<Text style={{ color: "#7CB798", fontSize: 14, marginTop: 8 }}>
						Add your first product to get started
					</Text>
				</View>
			) : (
				<ScrollView showsVerticalScrollIndicator={false}>
					{products.map((item) => (
						<View key={item.id} style={styles.card}>
							<View style={{ flex: 1 }}>
								<Text style={styles.status}>
									{item.stock && item.stock > 0 ? "Available" : "Out of Stock"}
								</Text>
								<Text style={styles.name}>{item.name}</Text>
								<Text style={styles.price}>
									Ksh {item.price?.toLocaleString()}
								</Text>
								{item.stock !== undefined && (
									<Text style={styles.stock}>Stock: {item.stock}</Text>
								)}
								<TouchableOpacity style={styles.editBtn}>
									<Feather name="edit-2" size={16} color="#fff" />
									<Text style={styles.editText}>Edit</Text>
								</TouchableOpacity>
							</View>
							{item.image ? (
								<Image source={{ uri: item.image }} style={styles.image} />
							) : (
								<View
									style={[
										styles.image,
										{
											backgroundColor: "#3A4A3D",
											justifyContent: "center",
											alignItems: "center",
										},
									]}
								>
									<Ionicons name="image-outline" size={32} color="#7CB798" />
								</View>
							)}
						</View>
					))}
				</ScrollView>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#18271B",
		padding: 16,
		paddingTop: 32,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 18,
		justifyContent: "space-between",
		marginTop: 30,
	},
	headerTitle: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
	},
	card: {
		flexDirection: "row",
		backgroundColor: "#223324",
		borderRadius: 14,
		padding: 14,
		marginBottom: 18,
		alignItems: "center",
	},
	status: {
		color: "#B6E2C6",
		fontSize: 13,
		marginBottom: 2,
	},
	name: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
		marginBottom: 2,
	},
	price: {
		color: "#fff",
		fontSize: 15,
		marginBottom: 4,
	},
	stock: {
		color: "#B6E2C6",
		fontSize: 13,
		marginBottom: 8,
	},
	editBtn: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#2B4B34",
		borderRadius: 6,
		paddingVertical: 4,
		paddingHorizontal: 12,
		alignSelf: "flex-start",
	},
	editText: {
		color: "#fff",
		fontSize: 14,
		marginLeft: 6,
	},
	image: {
		width: 90,
		height: 90,
		borderRadius: 10,
		marginLeft: 16,
		backgroundColor: "#3A4A3D",
	},
});

export default SellerManageListing;
