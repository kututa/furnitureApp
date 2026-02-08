import { Request, Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/cart.models";
import MpesaTransaction from "../models/mpesa.models";
import Order from "../models/orde.models";
import Product from "../models/product.models";
import { mpesaController } from "../services/mpesa.controller";
import { logger } from "../utils/logger";

// Helper function to calculate shipping
const calculateRandomShipping = (subtotal: number): number => {
  if (subtotal <= 0) return 0;
  const maxShipping = subtotal / 2;
  const randomShipping = Math.random() * maxShipping;
  return Math.round(randomShipping); // Round to nearest whole number
};

export const initiatePayment = async (req: Request, res: Response) => {
  logger.info("🔥 🔥 🔥 INITIATE PAYMENT CALLED 🔥 🔥 🔥");
  logger.info(`Request body: ${JSON.stringify(req.body)}`);
  logger.info(`User from token: ${req.user?.id}`);

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

    // Validate stock AND reduce it immediately (reserve stock for this order)
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

      // 📦 IMMEDIATELY REDUCE STOCK (reserve for this order)
      logger.info(
        `📦 BEFORE: Product "${product.name}" (ID: ${product._id}) has stock: ${product.stock}`,
      );
      logger.info(
        `📦 REDUCING: ${item.quantity} units from product "${product.name}"`,
      );

      const updateResult = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
      );

      if (updateResult.modifiedCount === 0) {
        logger.error(
          `❌ Stock update FAILED for ${product.name} - likely insufficient stock or concurrent purchase`,
        );
        return res
          .status(400)
          .json({ message: `Failed to reserve stock for ${product.name}` });
      }

      // Verify stock was updated
      const updatedProduct = await Product.findById(item.product);
      logger.info(
        `📦 AFTER: Product "${product.name}" (ID: ${product._id}) now has stock: ${updatedProduct?.stock}`,
      );
      logger.info(`✅ Successfully reduced stock by ${item.quantity} units`);

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

    logger.info(`✅ Stock reduced for all ${orderItems.length} items`);

    const shipping = calculateRandomShipping(subTotal);
    const total = Math.round(subTotal + shipping);

    logger.info(
      `💳 INITIATING PAYMENT: Subtotal Ksh ${subTotal} + Shipping Ksh ${shipping} = Total Ksh ${total}`,
    );

    // Generate order number
    const generateOrderNumber = () => {
      const prefix = "#";
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `${prefix}-${timestamp.slice(-8)}-${random}`;
    };

    // CREATE ACTUAL ORDER IMMEDIATELY (with pending payment status)
    const order = new Order({
      buyer: buyerId,
      seller: sellerId,
      items: orderItems,
      subTotal,
      shipping,
      total,
      paymentMethod: "mpesa",
      paymentStatus: "pending", // Will be updated to "paid" when callback arrives
      status: "pending",
      shippingInfo,
      orderNumber: generateOrderNumber(),
      phoneNumber: phoneNumber,
    });
    await order.save();

    logger.info(
      `📝 ORDER CREATED: ${order.orderNumber} | ID: ${order._id} | Status: payment pending`,
    );

    // Create pending transaction and link it to the order
    const tx = new MpesaTransaction({
      amount: total,
      phoneNumber: phoneNumber,
      status: "pending",
      order: order._id, // Link to the order we just created
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
        orderId: order._id.toString(), // Store order ID as string in metadata too
      },
    });
    await tx.save();

    logger.info(
      `📝 TRANSACTION CREATED: ID ${tx._id} | Linked to Order ${order._id}`,
    );
    logger.info(
      `🔗 Transaction.order = ${tx.order} | Metadata.orderId = ${tx.metadata.orderId}`,
    );

    // 🧪 TEST MODE: Skip M-Pesa and auto-complete payment
    const TEST_MODE = process.env.TEST_MODE === "true";

    let checkoutRequestId: string | null = null;
    let merchantRequestId: string | null = null;

    if (TEST_MODE) {
      // Skip M-Pesa API call entirely in test mode
      logger.info(`🧪 TEST MODE: Skipping M-Pesa API call...`);
      checkoutRequestId = `TEST-CHECKOUT-${Date.now()}`;
      merchantRequestId = `TEST-MERCHANT-${Date.now()}`;

      tx.checkoutRequestId = checkoutRequestId;
      tx.merchantRequestId = merchantRequestId;
      await tx.save();

      logger.info(`🧪 TEST MODE: Mock checkout IDs created`);
      logger.info(`🧪 TEST MODE: Auto-completing payment WITHOUT M-Pesa...`);

      // Update order to paid status
      order.paymentStatus = "paid";
      order.mpesaReceiptNumber = `TEST-${Date.now()}`;
      order.mpesaCheckoutRequestID = checkoutRequestId ?? undefined;
      await order.save();

      // Clear user's cart (same as callback does)
      await Cart.findOneAndDelete({ user: buyerId });

      // Update transaction to success
      tx.status = "success";
      tx.resultCode = 0;
      tx.resultDesc = "Test Mode - Auto Success";
      tx.mpesaReceiptNumber = `TEST-${Date.now()}`;
      await tx.save();

      logger.info(
        `✅ TEST MODE: Payment auto-completed | Order ${order.orderNumber} marked as PAID`,
      );
      logger.info(
        `✅ Stock remains REDUCED | Cart cleared | No callback needed`,
      );

      return res.status(200).json({
        success: true,
        message: "✅ TEST MODE: Payment completed automatically!",
        testMode: true,
        order: {
          id: order._id,
          _id: order._id,
          orderNumber: order.orderNumber,
          buyer: order.buyer,
          seller: order.seller,
          items: order.items,
          subTotal: order.subTotal,
          shipping: order.shipping,
          total: order.total,
          paymentStatus: "paid", // Already paid in test mode
          status: order.status,
          shippingInfo: order.shippingInfo,
          createdAt: order.createdAt,
          mpesaReceiptNumber: order.mpesaReceiptNumber,
        },
        transactionId: tx._id,
        checkoutRequestId,
      });
    }

    // PRODUCTION MODE: Send actual STK push via M-Pesa
    logger.info(`📱 PRODUCTION MODE: Sending STK push to M-Pesa...`);

    const mpesaRes: any = await mpesaController.initiatePayment({
      amount: total,
      products: orderItems,
      phoneNumber,
      accountReference: order.orderNumber ?? order._id.toString(),
      transactionDesc: `Payment for ${order.orderNumber ?? order._id.toString()}`,
    });

    if (mpesaRes?.error) {
      // Payment initiation failed - RESTORE STOCK and DELETE ORDER
      logger.warn(
        `⚠️ ⚠️ ⚠️ PAYMENT INITIATION FAILED - RESTORING STOCK ⚠️ ⚠️ ⚠️`,
      );
      logger.warn(`⚠️ M-Pesa Error: ${JSON.stringify(mpesaRes.error)}`);
      for (const item of orderItems) {
        const beforeRestore = await Product.findById(item.product);
        logger.warn(
          `↩️ BEFORE RESTORE: Product "${item.name}" stock: ${beforeRestore?.stock}`,
        );

        await Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
        );

        const afterRestore = await Product.findById(item.product);
        logger.warn(
          `↩️ AFTER RESTORE: Product "${item.name}" stock: ${afterRestore?.stock} (restored +${item.quantity})`,
        );
      }

      await Order.findByIdAndDelete(order._id); // Delete the order
      await MpesaTransaction.findByIdAndDelete(tx._id); // Cleanup failed tx
      logger.error(`❌ PAYMENT INITIATION FAILED: ${mpesaRes.error}`);
      return res.status(400).json({
        success: false,
        message: "Failed to initiate Mpesa payment",
        error: mpesaRes.details || mpesaRes.error,
      });
    }

    checkoutRequestId =
      mpesaRes?.CheckoutRequestID ??
      mpesaRes?.Response?.CheckoutRequestID ??
      null;
    merchantRequestId =
      mpesaRes?.MerchantRequestID ??
      mpesaRes?.Response?.MerchantRequestID ??
      null;

    tx.checkoutRequestId = checkoutRequestId;
    tx.merchantRequestId = merchantRequestId;
    await tx.save();

    logger.info(
      `📱 STK PUSH SENT: Phone ${phoneNumber} | Checkout ID ${checkoutRequestId} | Merchant ID ${merchantRequestId}`,
    );
    logger.info(
      `🔗 Transaction updated with checkout IDs - ready for callback`,
    );

    // Return the actual order that was created (payment pending)
    return res.status(200).json({
      success: true,
      message: "Payment initiated. Complete on your phone.",
      order: {
        id: order._id,
        _id: order._id,
        orderNumber: order.orderNumber,
        buyer: order.buyer,
        seller: order.seller,
        items: order.items,
        subTotal: order.subTotal,
        shipping: order.shipping,
        total: order.total,
        paymentStatus: order.paymentStatus,
        status: order.status,
        shippingInfo: order.shippingInfo,
        createdAt: order.createdAt,
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
  return res.status(405).json({
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
          ? (obj.buyer._id ?? obj.buyer)
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
          ? (obj.seller._id ?? obj.seller)
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
        { session },
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
