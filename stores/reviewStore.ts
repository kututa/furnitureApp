import { addReview, getReviews } from "@/SERVICE/api";
import { Review } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ReviewState = {
	reviews: Review[];
	isLoading: boolean;
	error: string | null;
	leaveReview: (
		product: string,
		content: string,
		stars: number
	) => Promise<void>;
	fetchReviews: (sellerId: string) => Promise<void>;
};

export const useReviewStore = create<ReviewState>()(
	persist(
		(set) => ({
			reviews: [],
			isLoading: false,
			error: null,

			leaveReview: async (product, content, stars) => {
				set({ isLoading: true, error: null });
				try {
					console.log("Submitting review:", { product, content, stars }); 
					const response = await addReview({ product, content, stars });
					console.log("Review response:", response); 

					if (response.success) {
						set((state) => ({
							reviews: [...state.reviews, response.review],
							isLoading: false,
						}));
					} else {
						set({
							error: response.message || "Failed to submit review",
							isLoading: false,
						});
					}
				} catch (error) {
					console.error("Failed to leave review:", error);
					set({
						error:
							error instanceof Error ? error.message : "Failed to leave review",
						isLoading: false,
					});
				}
			},

			fetchReviews: async (sellerId) => {
				set({ isLoading: true, error: null });
				try {
					const response = await getReviews(sellerId);
					console.log("Fetch reviews response:", response);

					 
					const reviewsArray = response?.reviews || [];

					console.log("Parsed reviews:", reviewsArray.length, "reviews");
					if (reviewsArray.length > 0) {
						console.log("First review user:", reviewsArray[0]?.user);
						console.log("First review product:", reviewsArray[0]?.product);
					}

					set({ reviews: reviewsArray, isLoading: false });
				} catch (error) {
					console.error("Failed to fetch reviews:", error);
					set({
						reviews: [],
						error:
							error instanceof Error
								? error.message
								: "Failed to fetch reviews",
						isLoading: false,
					});
				}
			},
		}),
		{
			name: "review_store",
			partialize: (state) => ({ reviews: state.reviews }),
			version: 1,
			storage: createJSONStorage(() => AsyncStorage),
		}
	)
);
