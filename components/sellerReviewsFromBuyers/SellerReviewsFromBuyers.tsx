import { useAuthStore } from "@/stores/authStore";
import { useReviewStore } from "@/stores/reviewStore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface SellerReviewsFromBuyersProps {
	onClose?: () => void;
	productId?: string;
}

const SellerReviewsFromBuyers: React.FC<SellerReviewsFromBuyersProps> = ({
	onClose,
	productId,
}) => {
	const navigation = useNavigation();
	const { user } = useAuthStore();
	const { reviews = [], fetchReviews, isLoading, error } = useReviewStore();
	const [dummyInteractions, setDummyInteractions] = useState<
		{ likes: number; comments: number }[]
	>([]);

	useEffect(() => {
		if (user?.id) {
			console.log("Fetching reviews for seller:", user.id);
			fetchReviews(user.id);
		}
	}, [user?.id]);

	useEffect(() => {
		if (reviews && reviews.length > 0) {
			console.log("Reviews received:", JSON.stringify(reviews, null, 2));
			setDummyInteractions(
				reviews.map(() => ({
					likes: Math.floor(Math.random() * 50) + 5,
					comments: Math.floor(Math.random() * 10) + 1,
				}))
			);
		}
	}, [reviews]);

	const handleClose = () => {
		if (onClose) {
			onClose();
		} else if (navigation?.goBack) {
			navigation.goBack();
		}
	};

	// Calculate average rating
	const averageRating =
		reviews && reviews.length > 0
			? (
					reviews.reduce((sum, r) => sum + (r.stars || 0), 0) / reviews.length
			  ).toFixed(1)
			: "0.0";

	// Calculate star distribution
	const starDistribution = [5, 4, 3, 2, 1].map((star) => {
		if (!reviews || reviews.length === 0) {
			return { star, count: 0, percentage: 0 };
		}
		const count = reviews.filter((r) => r.stars === star).length;
		const percentage = Math.round((count / reviews.length) * 100);
		return { star, count, percentage };
	});

	// Group reviews by product
	const reviewsByProduct: { [key: string]: any[] } = {};
	reviews.forEach((review) => {
		const productId =
			typeof review.product === "object"
				? review.product._id || review.product.id
				: review.product;
		const productName =
			typeof review.product === "object"
				? review.product.name
				: "Unknown Product";

		if (!reviewsByProduct[productId as string]) {
			reviewsByProduct[productId as string] = [];
		}
		reviewsByProduct[productId as string].push({
			...review,
			productName,
		});
	});

	if (isLoading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#38E472" />
				<Text style={styles.loadingText}>Loading reviews...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity onPress={handleClose} style={styles.closeButton}>
					<Ionicons name="close" size={28} color="#1B1B1B" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Customer Reviews</Text>
				<View style={{ width: 28 }} />
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Overall Statistics Card */}
				<View style={styles.statsCard}>
					<View style={styles.statsHeader}>
						<View style={styles.ratingContainer}>
							<Text style={styles.ratingValue}>{averageRating}</Text>
							<View style={styles.starsRow}>
								{[...Array(5)].map((_, i) => {
									const rating = parseFloat(averageRating);
									const isHalf = rating > i && rating < i + 1;
									return (
										<Ionicons
											key={i}
											name={
												isHalf
													? "star-half"
													: i < rating
													? "star"
													: "star-outline"
											}
											size={20}
											color="#38E472"
										/>
									);
								})}
							</View>
							<Text style={styles.reviewCount}>
								Based on {reviews?.length || 0}{" "}
								{reviews?.length === 1 ? "review" : "reviews"}
							</Text>
						</View>

						<View style={styles.distributionContainer}>
							{starDistribution.map(({ star, count, percentage }) => (
								<View key={star} style={styles.distributionRow}>
									<Text style={styles.starNum}>{star}</Text>
									<Ionicons name="star" size={14} color="#FFA726" />
									<View style={styles.barBackground}>
										<View
											style={[styles.barFill, { width: `${percentage}%` }]}
										/>
									</View>
									<Text style={styles.countText}>{count}</Text>
								</View>
							))}
						</View>
					</View>
				</View>

				{/* Error Message */}
				{error && (
					<View style={styles.errorContainer}>
						<Ionicons name="alert-circle" size={20} color="#c62828" />
						<Text style={styles.errorText}>{error}</Text>
					</View>
				)}

				{/* Empty State */}
				{(!reviews || reviews.length === 0) && !isLoading && (
					<View style={styles.emptyState}>
						<Ionicons name="chatbubble-outline" size={80} color="#E7F3EC" />
						<Text style={styles.emptyTitle}>No reviews yet</Text>
						<Text style={styles.emptySubtitle}>
							Your product reviews will appear here
						</Text>
					</View>
				)}

				{/* Reviews List - Grouped by Product */}
				{reviews && reviews.length > 0 && (
					<View style={styles.reviewsSection}>
						<Text style={styles.sectionTitle}>All Reviews</Text>

						{Object.entries(reviewsByProduct).map(
							([productId, productReviews]) => {
								const firstReview = productReviews[0];
								const productData =
									typeof firstReview.product === "object"
										? firstReview.product
										: null;

								return (
									<View key={productId} style={styles.productGroup}>
										{/* Product Header */}
										{productData && (
											<View style={styles.productHeader}>
												{productData.image ? (
													<Image
														source={{ uri: productData.image }}
														style={styles.productThumb}
													/>
												) : (
													<View style={styles.productThumbPlaceholder}>
														<Ionicons
															name="image-outline"
															size={24}
															color="#7CB798"
														/>
													</View>
												)}
												<View style={styles.productInfo}>
													<Text style={styles.productName}>
														{productData.name || "Product"}
													</Text>
													<Text style={styles.productReviewCount}>
														{productReviews.length}{" "}
														{productReviews.length === 1 ? "review" : "reviews"}
													</Text>
												</View>
											</View>
										)}

										{/* Reviews for this product */}
										{productReviews.map((item, index) => {
											const interactions = dummyInteractions[index] || {
												likes: 0,
												comments: 0,
											};

											// ✅ Extract buyer name with detailed logging
											let buyerName = "Anonymous Buyer";
											console.log("Review item:", item);
											console.log("User data:", item.user);

											if (typeof item.user === "object" && item.user) {
												buyerName =
													item.user.fullName ||
													item.user.name ||
													"Anonymous Buyer";
												console.log("Extracted buyer name:", buyerName);
											}

											return (
												<View key={index} style={styles.reviewCard}>
													<View style={styles.reviewHeader}>
														<View style={styles.buyerAvatar}>
															<Text style={styles.avatarText}>
																{buyerName.charAt(0).toUpperCase()}
															</Text>
														</View>
														<View style={styles.buyerInfo}>
															<Text style={styles.buyerName}>{buyerName}</Text>
															<View style={styles.reviewMeta}>
																{[...Array(item.stars || 0)].map((_, i) => (
																	<Ionicons
																		key={i}
																		name="star"
																		size={14}
																		color="#38E472"
																	/>
																))}
																{[...Array(5 - (item.stars || 0))].map(
																	(_, i) => (
																		<Ionicons
																			key={`outline-${i}`}
																			name="star-outline"
																			size={14}
																			color="#38E472"
																		/>
																	)
																)}
																<Text style={styles.reviewDate}>
																	{item.createdAt
																		? new Date(
																				item.createdAt
																		  ).toLocaleDateString("en-US", {
																				month: "short",
																				day: "numeric",
																				year: "numeric",
																		  })
																		: "Recently"}
																</Text>
															</View>
														</View>
													</View>

													<Text style={styles.reviewContent}>
														{item.content}
													</Text>

													<View style={styles.reviewActions}>
														<TouchableOpacity style={styles.actionButton}>
															<Ionicons
																name="thumbs-up-outline"
																size={18}
																color="#7CB798"
															/>
															<Text style={styles.actionText}>
																{interactions.likes}
															</Text>
														</TouchableOpacity>
														<TouchableOpacity style={styles.actionButton}>
															<Ionicons
																name="chatbubble-outline"
																size={18}
																color="#7CB798"
															/>
															<Text style={styles.actionText}>
																{interactions.comments}
															</Text>
														</TouchableOpacity>
													</View>
												</View>
											);
										})}
									</View>
								);
							}
						)}
					</View>
				)}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8FCF9",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F8FCF9",
	},
	loadingText: {
		color: "#7CB798",
		marginTop: 12,
		fontSize: 16,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingTop: 60,
		paddingBottom: 20,
		backgroundColor: "#fff",
		borderBottomWidth: 1,
		borderBottomColor: "#E7F3EC",
	},
	closeButton: {
		padding: 4,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#1B1B1B",
	},
	scrollContent: {
		padding: 20,
		paddingBottom: 40,
	},
	statsCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 20,
		marginBottom: 24,
		shadowColor: "#000",
		shadowOpacity: 0.06,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
		elevation: 3,
	},
	statsHeader: {
		flexDirection: "row",
		gap: 24,
	},
	ratingContainer: {
		alignItems: "center",
		minWidth: 100,
	},
	ratingValue: {
		fontSize: 48,
		fontWeight: "700",
		color: "#38E472",
		marginBottom: 8,
	},
	starsRow: {
		flexDirection: "row",
		marginBottom: 8,
		gap: 2,
	},
	reviewCount: {
		fontSize: 13,
		color: "#7CB798",
		textAlign: "center",
	},
	distributionContainer: {
		flex: 1,
		justifyContent: "center",
		gap: 6,
	},
	distributionRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	starNum: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1B1B1B",
		width: 12,
	},
	barBackground: {
		flex: 1,
		height: 8,
		backgroundColor: "#E7F3EC",
		borderRadius: 4,
		overflow: "hidden",
	},
	barFill: {
		height: "100%",
		backgroundColor: "#38E472",
		borderRadius: 4,
	},
	countText: {
		fontSize: 12,
		color: "#7CB798",
		width: 24,
		textAlign: "right",
	},
	errorContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#ffebee",
		padding: 16,
		borderRadius: 12,
		marginBottom: 16,
		gap: 12,
	},
	errorText: {
		flex: 1,
		color: "#c62828",
		fontSize: 14,
	},
	emptyState: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 80,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#1B1B1B",
		marginTop: 20,
	},
	emptySubtitle: {
		fontSize: 14,
		color: "#7CB798",
		marginTop: 8,
		textAlign: "center",
	},
	reviewsSection: {
		gap: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1B1B1B",
		marginBottom: 8,
	},
	productGroup: {
		marginBottom: 24,
	},
	productHeader: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 12,
		borderRadius: 12,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOpacity: 0.04,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	productThumb: {
		width: 60,
		height: 60,
		borderRadius: 8,
		backgroundColor: "#E7F3EC",
	},
	productThumbPlaceholder: {
		width: 60,
		height: 60,
		borderRadius: 8,
		backgroundColor: "#E7F3EC",
		justifyContent: "center",
		alignItems: "center",
	},
	productInfo: {
		flex: 1,
		marginLeft: 12,
	},
	productName: {
		fontSize: 16,
		fontWeight: "700",
		color: "#1B1B1B",
		marginBottom: 4,
	},
	productReviewCount: {
		fontSize: 13,
		color: "#7CB798",
	},
	reviewCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOpacity: 0.04,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
		elevation: 2,
	},
	reviewHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	buyerAvatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "#38E472",
		justifyContent: "center",
		alignItems: "center",
	},
	avatarText: {
		fontSize: 18,
		fontWeight: "700",
		color: "#fff",
	},
	buyerInfo: {
		flex: 1,
		marginLeft: 12,
	},
	buyerName: {
		fontSize: 16,
		fontWeight: "700",
		color: "#1B1B1B",
		marginBottom: 4,
	},
	reviewMeta: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	reviewDate: {
		fontSize: 12,
		color: "#7CB798",
		marginLeft: 4,
	},
	reviewContent: {
		fontSize: 15,
		color: "#1B1B1B",
		lineHeight: 22,
		marginBottom: 12,
	},
	reviewActions: {
		flexDirection: "row",
		gap: 20,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#E7F3EC",
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	actionText: {
		fontSize: 14,
		color: "#7CB798",
		fontWeight: "600",
	},
});

export default SellerReviewsFromBuyers;
