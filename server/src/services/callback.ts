import { Request, Response } from "express";

import Cart from "../models/cart.models";
import MpesaTransaction from "../models/mpesa.models";
import Order from "../models/orde.models";
import Product from "../models/product.models";
import { logger } from "../utils/logger";

export const callBack = async (req: Request, res: Response) => {
	try {
		logger.info("=== CALLBACK DEBUG INFO ===");
		logger.info("Headers:", JSON.stringify(req.headers, null, 2));
		logger.info("Body:", JSON.stringify(req.body, null, 2));
		logger.info("Raw body:", req.body);
		logger.info("Body type:", typeof req.body);
		logger.info("Body keys:", Object.keys(req.body || {}));
		logger.info("=== END DEBUG INFO ===");

	 
		const body = req.body;
		const stk = body?.Body?.stkCallback;
		if (!stk?.CheckoutRequestID) {
			return res.status(400).json({ error: "Invalid callback format" });
		}

		const resultCode = stk.ResultCode;
		const resultDesc = stk.ResultDesc;
		const checkoutRequestId = stk.CheckoutRequestID;
		const merchantRequestId = stk.MerchantRequestID;

		let amount = 0;
		let phoneNumber = "Unknown";
		let mpesaReceiptNumber = "";
		let transactionDate = "";

		if (resultCode === 0 && stk.CallbackMetadata?.Item) {
			for (const item of stk.CallbackMetadata.Item) {
				switch (item.Name) {
					case "Amount":
						amount = parseFloat(item.Value);
						break;
					case "PhoneNumber":
						phoneNumber = String(item.Value);
						break;
					case "MpesaReceiptNumber":
						mpesaReceiptNumber = String(item.Value);
						break;
					case "TransactionDate":
						transactionDate = String(item.Value);
						break;
				}
			}
		}

		// Find existing transaction created during initiate-payment
		let tx = await MpesaTransaction.findOne({ checkoutRequestId });
		if (!tx && merchantRequestId) {
			tx = await MpesaTransaction.findOne({ merchantRequestId });
		}
		if (!tx) {
			return res
				.status(200)
				.json({ message: "Transaction not found, ignored" });
		}

		// Update tx basics (guarantee null fallback, not undefined)
		tx.resultCode = resultCode;
		tx.resultDesc = resultDesc;
		tx.merchantRequestId = tx.merchantRequestId || merchantRequestId || null;

		const newReceipt =
			mpesaReceiptNumber && mpesaReceiptNumber.trim() !== ""
				? mpesaReceiptNumber
				: tx.mpesaReceiptNumber ?? null;
		tx.mpesaReceiptNumber = newReceipt; // <- string | null only

		const newTxDate =
			transactionDate && transactionDate.trim() !== ""
				? transactionDate
				: tx.transactionDate ?? null;
		tx.transactionDate = newTxDate; // <- string | null only

		tx.phoneNumber = phoneNumber || tx.phoneNumber || "Unknown";

		if (resultCode !== 0) {
			tx.status = "failed";
			await tx.save();
			logger.warn("Payment not successful. No order created.");
			return res
				.status(200)
				.json({ message: "Callback processed (failed/cancelled/timeout)" });
		}

		// SUCCESS: create order now from stored metadata and reduce stock
		const meta: any = tx.metadata || {};
		const generateOrderNumber = () => {
			const prefix = "#";
			const timestamp = Date.now().toString();
			const random = Math.floor(Math.random() * 1000)
				.toString()
				.padStart(3, "0");
			return `${prefix}-${timestamp.slice(-8)}-${random}`;
		};

		// Reduce stock atomically
		for (const item of meta.items || []) {
			await Product.updateOne(
				{ _id: item.product },
				{ $inc: { stock: -item.quantity } }
			);
		}

		// Create actual Order from transaction metadata
		const order = new Order({
			buyer: tx.metadata.buyerId,
			seller: tx.metadata.sellerId,
			items: tx.metadata.items,
			subTotal: tx.metadata.subTotal,
			shipping: tx.metadata.shipping,
			total: tx.metadata.total,
			paymentMethod: "mpesa",
			paymentStatus: "paid",
			status: "confirmed", // 
			shippingInfo: tx.metadata.shippingInfo,
			orderNumber: generateOrderNumber(), //  
			mpesaReceiptNumber: mpesaReceiptNumber,
			mpesaCheckoutRequestID: checkoutRequestId,
		});
		await order.save(); //  
		tx.order = order._id;

		// Clear user's cart after successful payment
		await Cart.findOneAndDelete({ user: tx.metadata.buyerId }); //  

		// Update transaction status
		tx.status = "success";
		tx.order = order._id; // 
		await tx.save();

		logger.info(`Order ${order.orderNumber} created after successful payment`);
		return res.status(200).json({ message: "Callback processed successfully" });
	} catch (error) {
		logger.error("Error processing M-Pesa callback:", error);
		return res.status(500).json({ error: "Failed to process callback" });
	}
};
