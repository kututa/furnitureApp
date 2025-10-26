import { Request, Response } from "express";
import mongoose from "mongoose";
import MpesaTransaction from "../models/mpesa.models";
import Order from "../models/orde.models";
import Product from "../models/product.models";
import { mpesaController } from "../services/mpesa.controller";
import { logger } from "../utils/logger";

export const initiatePayment = async (req: Request, res: Response) => {
	// only mpesa is supported
	const buyerId = req.user?.id ?? req.body?.buyer;
	const { items, paymentMethod, phoneNumber, shippingInfo } = req.body;

	try {
		if (!buyerId)
			return res.status(401).json({ message: "Authentication required" });
		if (!Array.isArray(items) || items.length === 0)
			return res.status(400).json({ message: "Items required" });
		if (paymentMethod !== "mpesa")
			return res.status(400).json({ message: "Only mpesa is supported" });
		if (!phoneNumber)
			return res.status(400).json({ message: "Phone number required" });

		let subTotal = 0;
		const orderItems: any[] = [];
		let sellerId: any = undefined;

		// Validate stock but do NOT reduce it yet
		for (const item of items) {
			const product = await Product.findById(item.product);
			if (!product)
				return res
					.status(404)
					.json({ message: `Product ${item.product} not found` });
			if (product.stock < item.quantity)
				return res
					.status(400)
					.json({ message: `Insufficient stock for ${product.name}` });

			subTotal += product.price * item.quantity;
			orderItems.push({
				product: product._id,
				name: product.name,
				price: product.price,
				quantity: item.quantity,
				image: product.image,
			});
			if (!sellerId && (product as any).seller)
				sellerId = (product as any).seller;
		}

		const shipping = subTotal * 0.1;
		const total = Math.round(subTotal + shipping);

		// Create pending transaction and store all data needed to build order later
		const tx = new MpesaTransaction({
			amount: total,
			phoneNumber: phoneNumber,
			status: "pending",
			products: orderItems.map((it) => ({
				product: it.product,
				quantity: it.quantity,
				price: it.price,
			})),
			metadata: {
				buyerId,
				sellerId,
				shippingInfo,
				items: orderItems,
				subTotal,
				shipping,
				total,
				paymentMethod: "mpesa",
			},
		});
		await tx.save();

		// Send STK push (accountReference uses transaction id)
		const mpesaRes: any = await mpesaController.initiatePayment({
			amount: total,
			products: orderItems,
			phoneNumber,
			accountReference: String(tx._id),
			transactionDesc: "Payment for order",
		});

		if (mpesaRes?.error) {
			logger.error("Failed to initiate Mpesa", mpesaRes);
			return res.status(400).json({
				success: false,
				message: "Failed to initiate Mpesa payment",
				error: mpesaRes.details || mpesaRes.error,
				transactionId: tx._id,
			});
		}

		const checkoutRequestId =
			mpesaRes?.CheckoutRequestID ??
			mpesaRes?.Response?.CheckoutRequestID ??
			null;
		const merchantRequestId =
			mpesaRes?.MerchantRequestID ??
			mpesaRes?.Response?.MerchantRequestID ??
			null;

		tx.checkoutRequestId = checkoutRequestId ?? undefined;
		tx.merchantRequestId = merchantRequestId ?? undefined;
		await tx.save();

		// In initiatePayment, return transaction data formatted as order-like:
		return res.status(200).json({
			success: true,
			message: "Payment initiated. Complete on your phone.",
			order: {
				id: tx._id,
				_id: tx._id,
				orderNumber: `ORD-${tx._id.toString().slice(-6)}`,
				subTotal,
				shipping,
				total,
				paymentStatus: "pending",
				status: "pending",
			},
			transactionId: tx._id,
			checkoutRequestId,
		});
	} catch (err) {
		logger.error("initiatePayment failed", err);
		return res.status(500).json({ message: "Server Error" });
	}
};

// OPTIONAL: prevent direct order creation via POST /order
export const makeOrder = async (_req: Request, res: Response) => {
	return res
		.status(405)
		.json({
			success: false,
			message:
				"Direct order creation disabled. Use /order/initiate-payment (mpesa only).",
		});
};

export const getSellersOrders = async (req: Request, res: Response) => {
	const sellerId = req.params.id ?? req.user?.id;
	if (!sellerId)
		return res.status(401).json({ message: "Authentication required" });

	try {
		const orders = await Order.find({ seller: sellerId })
			.populate("items.product", "name images")
			.populate("buyer", "_id") // populate buyer so we can return buyer id reliably
			.sort({ createdAt: -1 });

		const out = orders.map((o) => {
			const obj = o.toObject();
			const buyerId =
				obj.buyer && typeof obj.buyer === "object"
					? obj.buyer._id ?? obj.buyer
					: obj.buyer;
			return { ...obj, buyerId, seller: undefined };
		});

		return res.status(200).json({ success: true, orders: out });
	} catch (err) {
		logger.error("Failed to fetch orders", err);
		return res.status(500).json({ message: "Server Error" });
	}
};

export const getBuyersOrders = async (req: Request, res: Response) => {
	const buyerId = req.params.id ?? req.user?.id;
	if (!buyerId)
		return res.status(401).json({ message: "Authentication required" });

	try {
		const orders = await Order.find({ buyer: buyerId })
			.populate("items.product", "name images")
			.populate("seller", "_id") // populate seller so we can return seller id
			.sort({ createdAt: -1 });

		const out = orders.map((o) => {
			const obj = o.toObject();
			const sellerId =
				obj.seller && typeof obj.seller === "object"
					? obj.seller._id ?? obj.seller
					: obj.seller;
			return { ...obj, sellerId };
		});

		return res.status(200).json({ success: true, orders: out });
	} catch (err) {
		logger.error("Failed to fetch orders");
		return res.status(500).json({ message: "Server Error" });
	}
};
export const updateStatus = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { status } = req.body;

	try {
		const order = await Order.findById(id);
		if (!order) {
			res.status(400).json({ message: "Order not found" });
			return;
		}
		const oldStatus = order.status;
		order.status = status;

		if (status === "delivered" && oldStatus !== "delivered") {
			order.actualDelivery = new Date();
		}

		await order.save();
		logger.info(`stsrus of ${order.orderNumber} updated`);
		res.status(200).json({ seccess: true, order });
	} catch (err) {
		logger.error("Failed to update status");
		res.status(500).json({ message: "Server error" });
	}
};

export const cancelOrder = async (req: Request, res: Response) => {
	const { id } = req.params;
	const userId = req.user?.id;

	if (!userId) {
		return res.status(401).json({ message: "Authentication required" });
	}

	const session = await mongoose.startSession();
	try {
		session.startTransaction();

		// load order inside session (populate for convenience)
		const order = await Order.findById(id)
			.session(session)
			.populate("items.product");
		if (!order) {
			await session.abortTransaction();
			session.endSession();
			return res
				.status(404)
				.json({ success: false, message: "Order not found" });
		}

		const status = (order.status ?? "").toString().toLowerCase();
		if (["shipped", "delivered", "cancelled"].includes(status)) {
			await session.abortTransaction();
			session.endSession();
			res
				.status(400)
				.json({ success: false, message: "Order cannot be cancelled" });
			return;
		}

		// Authorization: allow buyer or seller to cancel
		const orderBuyerId = String(order.buyer);
		const orderSellerId = order.seller ? String(order.seller) : undefined;
		if (userId !== orderBuyerId && userId !== orderSellerId) {
			await session.abortTransaction();
			session.endSession();
			return res.status(403).json({
				success: false,
				message: "Not authorized to cancel this order",
			});
		}

		// Restore stock using atomic $inc updates (safer & faster than loading each product)
		for (const item of order.items ?? []) {
			const productId = (item.product as any)?._id ?? item.product;
			if (!productId) continue;
			await Product.updateOne(
				{ _id: productId },
				{ $inc: { stock: item.quantity } },
				{ session }
			);
		}

		order.status = "cancelled";
		await order.save({ session });

		await session.commitTransaction();
		session.endSession();

		// populate for response (outside transaction)
		await order.populate("items.product");
		logger.info("Order canceled");
		return res.status(200).json({ success: true, order });
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		logger.error("Failed to cancel order", err);
		return res.status(500).json({ message: "Server Error" });
	}
};
