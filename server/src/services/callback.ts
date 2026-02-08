import { Request, Response } from "express";

import Cart from "../models/cart.models";
import MpesaTransaction from "../models/mpesa.models";
import Order from "../models/orde.models";
import Product from "../models/product.models";
import { logger } from "../utils/logger";

export const callBack = async (req: Request, res: Response) => {
  try {
    logger.info("🔔 === M-PESA CALLBACK RECEIVED ===");
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
      logger.warn(
        `⚠️ Transaction not found for CheckoutRequestID: ${checkoutRequestId}`,
      );
      // Log all recent transactions for debugging
      const recentTx = await MpesaTransaction.find({})
        .sort({ createdAt: -1 })
        .limit(5);
      logger.info(
        `Recent transactions:`,
        recentTx.map((t) => ({
          id: t._id,
          checkoutRequestId: t.checkoutRequestId,
          merchantRequestId: t.merchantRequestId,
          status: t.status,
        })),
      );
      return res
        .status(200)
        .json({ message: "Transaction not found, ignored" });
    }

    logger.info(`🔍 Found transaction: ${tx._id} | Order: ${tx.order}`);

    // Update tx basics (guarantee null fallback, not undefined)
    tx.resultCode = resultCode;
    tx.resultDesc = resultDesc;
    tx.merchantRequestId = tx.merchantRequestId || merchantRequestId || null;

    const newReceipt =
      mpesaReceiptNumber && mpesaReceiptNumber.trim() !== ""
        ? mpesaReceiptNumber
        : (tx.mpesaReceiptNumber ?? null);
    tx.mpesaReceiptNumber = newReceipt; // <- string | null only

    const newTxDate =
      transactionDate && transactionDate.trim() !== ""
        ? transactionDate
        : (tx.transactionDate ?? null);
    tx.transactionDate = newTxDate; // <- string | null only

    tx.phoneNumber = phoneNumber || tx.phoneNumber || "Unknown";

    if (resultCode !== 0) {
      tx.status = "failed";

      // RESTORE STOCK and DELETE ORDER - payment failed
      const meta: any = tx.metadata || {};

      // Delete the order that was created during payment initiation
      if (tx.order || meta.orderId) {
        const orderId = tx.order || meta.orderId;
        await Order.findByIdAndDelete(orderId);
        logger.warn(`🗑️ Order ${orderId} deleted due to payment failure`);
      }

      // Restore stock
      if (meta.items && meta.items.length > 0) {
        logger.warn(
          `⚠️ ⚠️ ⚠️ PAYMENT CALLBACK FAILED (Code: ${resultCode}) - RESTORING STOCK ⚠️ ⚠️ ⚠️`,
        );
        logger.warn(`Result Description: ${resultDesc}`);
        for (const item of meta.items) {
          const beforeRestore = await Product.findById(item.product);
          logger.warn(
            `↩️ BEFORE RESTORE: Product ${item.product} stock: ${beforeRestore?.stock}`,
          );

          await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.quantity } },
          );

          const afterRestore = await Product.findById(item.product);
          logger.warn(
            `↩️ AFTER RESTORE: Product ${item.product} stock: ${afterRestore?.stock} (restored +${item.quantity})`,
          );
        }
        logger.warn(`✅ Stock restored for all ${meta.items.length} items`);
      }

      await tx.save();
      // resultCode meanings:
      // 1 - User cancelled payment
      // 2 - Payment timed out
      // Other codes - Payment failed/error
      const cancelReasons: Record<number, string> = {
        1: "Payment cancelled by user",
        2: "Payment request timed out",
      };
      const reason =
        cancelReasons[resultCode] || resultDesc || "Payment failed";
      logger.warn(
        `Payment not successful (${reason}). Order deleted, stock restored.`,
      );
      return res.status(200).json({
        message: "Callback processed - payment not successful",
        reason,
      });
    }

    // SUCCESS: Update existing order to "paid" status
    // NOTE: Order was already created during payment initiation, stock already reduced
    const meta: any = tx.metadata || {};

    logger.info("📋 Transaction metadata:", JSON.stringify(meta, null, 2));
    logger.info(`✅ ✅ ✅ PAYMENT SUCCESSFUL (Code: ${resultCode}) ✅ ✅ ✅`);
    logger.info(
      `✅ Stock was ALREADY REDUCED during payment initiation - NOT restoring`,
    );
    logger.info(`✅ Updating order to PAID status...`);

    // Find the order that was created during payment initiation
    const orderId = tx.order || meta.orderId;
    if (!orderId) {
      logger.error("❌ No order ID found in transaction");
      logger.error(`Transaction details:`, {
        txId: tx._id,
        hasOrder: !!tx.order,
        hasMetadata: !!tx.metadata,
        metadataKeys: meta ? Object.keys(meta) : [],
      });
      return res.status(200).json({ message: "Order ID not found" });
    }

    logger.info(`🔍 Looking for order: ${orderId}`);
    const order = await Order.findById(orderId);
    if (!order) {
      logger.error(`❌ Order ${orderId} not found in database`);
      // Check if order exists at all
      const orderCount = await Order.countDocuments({});
      logger.info(`Total orders in database: ${orderCount}`);
      return res.status(200).json({ message: "Order not found" });
    }

    logger.info(
      `✅ Found order: ${order.orderNumber} | Current status: ${order.paymentStatus}`,
    );

    // Update order payment status to paid
    order.paymentStatus = "paid";
    order.mpesaReceiptNumber = mpesaReceiptNumber;
    order.mpesaCheckoutRequestID = checkoutRequestId;
    await order.save();

    // Clear user's cart after successful payment
    await Cart.findOneAndDelete({ user: meta.buyerId });

    // Update transaction status to success
    tx.status = "success";
    await tx.save();

    logger.info(
      `✅ ORDER UPDATED: ${order.orderNumber} | Payment successful | Receipt: ${mpesaReceiptNumber}`,
    );
    logger.info(
      `   Buyer: ${tx.metadata.buyerId} | Amount: Ksh ${amount} | Status: paid`,
    );
    logger.info(`✅ Stock remains REDUCED - payment confirmed | Cart cleared`);
    return res.status(200).json({ message: "Callback processed successfully" });
  } catch (error) {
    logger.error("Error processing M-Pesa callback:", error);
    return res.status(500).json({ error: "Failed to process callback" });
  }
};
