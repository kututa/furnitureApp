import { useReviewStore } from "@/stores/reviewStore"; // Import the review store
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

const ReviewInterface = ({
	visible,
	onClose,
	productId,
}: {
	visible: boolean;
	onClose: () => void;
	productId: string;
}) => {
	const [review, setReview] = useState("");
	const [stars, setStars] = useState(0); // State to hold the selected star rating
	const { leaveReview, isLoading, error } = useReviewStore(); // Access the review store

	const handleSubmit = async () => {
		if (review.trim() === "" || stars === 0) {
			alert("Please provide a review and a star rating.");
			return;
		}
		await leaveReview(productId, review, stars);
		setReview(""); // Clear the review input
		setStars(0); // Reset the star rating
		onClose(); // Close the modal after submission
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<View style={styles.modal}>
					<Pressable style={styles.closeBtn} onPress={onClose}>
						<Ionicons name="close" size={28} color="#222" />
					</Pressable>
					<Text style={styles.title}>Rate Product</Text>
					<Text style={styles.subtitle}>How would you rate this product?</Text>
					<View style={styles.row}>
						<Text style={styles.ratingNum}>{stars > 0 ? stars : "0"}</Text>
						<View style={{ marginLeft: 8 }}>
							<View style={styles.starsRow}>
								{[1, 2, 3, 4, 5].map((i) => (
									<TouchableOpacity key={i} onPress={() => setStars(i)}>
										<Ionicons
											name={i <= stars ? "star" : "star-outline"}
											size={20}
											color="#38E472"
										/>
									</TouchableOpacity>
								))}
							</View>
							<Text style={styles.reviewsText}>Rate your experience</Text>
						</View>
					</View>
					<TextInput
						style={styles.input}
						placeholder="Write your review..."
						placeholderTextColor="#7CB798"
						value={review}
						onChangeText={setReview}
						multiline
					/>
					<TouchableOpacity
						style={styles.submitBtn}
						onPress={handleSubmit}
						disabled={isLoading}
					>
						{isLoading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<Text style={styles.submitBtnText}>Submit Review</Text>
						)}
					</TouchableOpacity>
					{error && <Text style={styles.errorText}>{error}</Text>}
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		width: "92%",
		backgroundColor: "#F8FCF9",
		borderRadius: 12,
		padding: 18,
		alignItems: "flex-start",
		position: "relative",
	},
	closeBtn: {
		position: "absolute",
		top: 10,
		left: 10,
		zIndex: 2,
	},
	title: {
		alignSelf: "center",
		fontSize: 18,
		fontWeight: "bold",
		color: "#222",
		marginBottom: 10,
		width: "100%",
		textAlign: "center",
	},
	subtitle: {
		fontSize: 15,
		color: "#222",
		marginBottom: 10,
		width: "100%",
		textAlign: "left",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	ratingNum: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#38E472",
	},
	starsRow: {
		flexDirection: "row",
		marginBottom: 2,
	},
	reviewsText: {
		color: "#7CB798",
		fontSize: 13,
	},
	input: {
		width: "100%",
		minHeight: 60,
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#E7F3EC",
		padding: 10,
		fontSize: 15,
		color: "#222",
		marginBottom: 18,
		marginTop: 8,
	},
	submitBtn: {
		alignSelf: "flex-end",
		backgroundColor: "#38E472",
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 22,
	},
	submitBtnText: {
		color: "#111",
		fontWeight: "bold",
		fontSize: 16,
	},
	errorText: {
		color: "red",
		marginTop: 10,
	},
});

export default ReviewInterface;
