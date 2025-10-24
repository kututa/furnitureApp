export interface User {
	id: string;
	fullName: string;
	email: string;
	role: "buyer" | "seller";
}

export interface RegisterInput {
	fullName: string;
	email: string;
	password: string;
	role: "buyer" | "seller";
}

export interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	image: string;
	category: string;
	stock: number;
}

export interface AddProduct {
	seller: string;
	name: string;
	description: string;
	price: number;
	image: string;
	category: string;
	stock: number;
}

export interface Cart {
	user: string;
	productId: string;
	quantity: number;
	price: string;
	subtotal: number;
	shipping: number;
	total: number;
}

export interface Order {
	id: string;
	_id?: string;
	buyer?: string; // ✅ Changed from 'user' to 'buyer' to match backend
	user?: string; // ✅ Keep for backward compatibility
	seller?: string;
	orderNumber?: string; // ✅ Added orderNumber
	products: {
		product: Product;
		quantity: number;
	}[];
	items?: {
		// ✅ Added items (backend uses this field)
		product: string;
		name: string;
		price: number;
		quantity: number;
		image: string;
	}[];
	subTotal?: number; // ✅ Added subTotal
	shipping?: number; // ✅ Added shipping
	total?: number; // ✅ Added total
	totalAmount?: number; // ✅ Keep for backward compatibility
	paymentMethod: "mpesa"; // ✅ Changed to lowercase
	paymentStatus: "pending" | "paid" | "failed" | "cancelled" | "timeout";
	phoneNumber?: string;
	mpesaCheckoutRequestID?: string;
	mpesaReceiptNumber?: string;
	shippingInfo?: {
		city: string;
		address: string;
	};
	createdAt?: string;
	updatedAt?: string;
	resultDesc?: string;
}

export interface makeOrder {
	buyer?: string; // ✅ Added buyer field (backend uses this)
	items: {
		product: string;
		quantity: number;
	}[];
	phoneNumber: string;
	paymentMethod: "mpesa"; // ✅ Changed to lowercase to match backend
	shippingInfo: {
		city: string;
		address: string;
	};
}

export interface CartItem {
	product: Product;
	quantity: number;
}

export interface Review {
	id?: string;
	product:
		| string
		| {
				id?: string;
				_id?: string;
				name?: string;
				image?: string;
				price?: number;
				description?: string;
		  };
	content: string;
	stars: number;
	user?:
		| {
				id?: string;
				_id?: string;
				fullName?: string;
				email?: string;
		  }
		| string;
	createdAt?: string;
	updatedAt?: string;
}
