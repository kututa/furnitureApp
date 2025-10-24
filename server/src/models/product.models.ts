import { number, required } from "joi";
import mongoose, { Schema, Types } from "mongoose";

const productSchema = new Schema(
	{
		seller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		name: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			required: true,
		},
		image: {
			type: String,
			required: false,
		},
		images: {
			type: [String],
			required: false,
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
		},
		stock: {
			type: Number,
			required: true,
			default: 0,
		},
		reviewCount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
