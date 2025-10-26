import mongoose, { Schema } from "mongoose";

const mpesaTransactionSchema = new Schema(
	{
		amount: { type: Number, required: true },
		phoneNumber: { type: String, required: true },
		name: { type: String, default: null },
		status: {
			type: String,
			enum: ["pending", "success", "failed"],
			default: "pending",
		},
		mpesaReceiptNumber: { type: String, default: null }, // ensure null default
		checkoutRequestId: { type: String, default: null },
		merchantRequestId: { type: String, default: null }, // ensure null default
		resultCode: { type: Number, default: null },
		resultDesc: { type: String, default: null },
		transactionDate: { type: String, default: null }, // ensure null default
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
				},
				quantity: { type: Number },
				price: { type: Number },
			},
		],
		order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
		// store all data needed to build order after payment
		metadata: { type: Schema.Types.Mixed, default: null },
	},
	{ timestamps: true }
);

export default mongoose.model("MpesaTransaction", mpesaTransactionSchema);
