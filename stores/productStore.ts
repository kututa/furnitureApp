import { Product } from "@/types";
import { create } from "zustand";

import {
	addProduct,
	deleteProduct,
	getProduct,
	getProductListing,
	getProducts,
	updateProduct,
	updateStock,
} from "@/SERVICE/api";

interface ProductStore {
	products: Product[];
	isLoading: boolean;
	createProduct: (product: FormData) => Promise<void>;
	update_product: (id: string, updatedProduct: Product) => Promise<void>;
	updateStock: (id: string, stock: number) => Promise<void>;
	removeProduct: (id: string) => void;
	fetchProducts: () => Promise<void>;
	fetchProduct: (id: string) => Promise<Product | null>;
	fetchSellersListings: (sellerId: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>()((set) => ({
	products: [],
	isLoading: false,
	createProduct: async (formData: FormData) => {
		try {
			set({ isLoading: true });
			const response = await addProduct(formData);
			console.log("Product created:", response);

			const newProduct =
				response.newProduct || response.product || response.data || response;

			const mappedProduct = {
				...newProduct,
				id: newProduct._id || newProduct.id,
			};

			set((state) => ({
				products: [...state.products, mappedProduct],
				isLoading: false,
			}));
		} catch (error) {
			console.error("Error creating product:", error);
			set({ isLoading: false });
			throw error;
		}
	},
	update_product: async (id: string, updatedProduct: Product) => {
		try {
			set({ isLoading: true });
			const product = await updateProduct(id, updatedProduct);
			if (product) {
				set((state) => ({
					products: state.products.map((p) =>
						p.id === id ? { ...p, ...updatedProduct } : p
					),
					isLoading: false,
				}));
			} else {
				set({ isLoading: false });
			}
		} catch (error) {
			console.error("Error updating product:", error);
			set({ isLoading: false });
		}
	},
	updateStock: async (id: string, stock: number) => {
		try {
			set({ isLoading: true });
			await updateStock(id, stock);
			set((state) => ({
				products: state.products.map((p) =>
					p.id === id ? { ...p, stock } : p
				),
				isLoading: false,
			}));
		} catch (error) {
			console.error("Error updating stock:", error);
			set({ isLoading: false });
			throw error;
		}
	},
	removeProduct: async (id: string) => {
		try {
			await deleteProduct(id);
			set((state) => ({
				products: state.products.filter((product) => product.id !== id),
			}));
		} catch (error) {
			console.error("Error removing product:", error);
		}
	},
	fetchProducts: async () => {
		try {
			set({ isLoading: true });
			const products = await getProducts();

			const mapped = products.map((p: any) => ({
				...p,
				id: p._id || p.id,
			}));
			console.log("data:", mapped);
			set({ products: mapped, isLoading: false });
		} catch (error) {
			console.error("Error fetching products:", error);
			set({ isLoading: false });
		}
	},
	fetchProduct: async (id: string) => {
		try {
			set({ isLoading: true });
			const product = await getProduct(id);
			if (product) {
				set((state) => ({
					products: state.products.map((p) => (p.id === id ? product : p)),
					isLoading: false,
				}));
				return product;
			}
			set({ isLoading: false });
			return null;
		} catch (error) {
			console.error("Error fetching product:", error);
			set({ isLoading: false });
			return null;
		}
	},
	fetchSellersListings: async (sellerId: string) => {
		try {
			set({ isLoading: true });
			const listings = await getProductListing(sellerId);
			console.log("Fetched listings:", listings); // Debug log

			// listings is an array of { id, product: {...}, isActive, createdAt }
			const mapped = listings.map((listing: any) => {
				const product = listing.product || {};
				return {
					...product,
					id: product._id || product.id,
					listingId: listing.id,
					isActive: listing.isActive,
				};
			});

			console.log("Mapped products:", mapped); // Debug log
			set({ products: mapped, isLoading: false });
		} catch (error) {
			console.error("Error fetching products:", error);
			set({ isLoading: false, products: [] });
		}
	},
}));
