import { Request, Response } from "express";
import mongoose from "mongoose";

import Cart from "../models/cart.models";
import Product from "../models/product.models";
import { logger } from "../utils/logger";

const calculateTotals = (items: { price: number; quantity: number }[]) => {
  const subTotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shipping = subTotal * 0.1; // 10% shipping
  const total = subTotal + shipping;
  return { subTotal, shipping, total };
};

export const addToCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { productId, quantity = 1 } = req.body;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }

  if (req.user?.role && req.user.role !== "buyer") {
    res.status(403).json({ success: false, message: "Need to be a buyer" });
    return;
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    let cart = await Cart.findOne({ user: userObjectId });

    if (!cart) {
      const items = [
        {
          product: product._id,
          quantity: Number(quantity),
          price: product.price,
        },
      ];
      const totals = calculateTotals(items);
      cart = new Cart({ user: userObjectId, items, ...totals });
    } else {
      cart.items = cart.items ?? [];

      const itemIndex = cart.items.findIndex(
        (it) => it.product.toString() === product._id.toString(),
      );

      if (itemIndex > -1) {
        const item = cart.items[itemIndex]; // read once
        const currentQty = item?.quantity ?? 0; // guard undefined
        item!.quantity = currentQty + Number(quantity);
      } else {
        cart.items.push({
          product: product._id,
          quantity: Number(quantity),
          price: product.price,
        });
      }

      const totals = calculateTotals(
        (cart.items ?? []).map((it) => ({
          price: it.price,
          quantity: it.quantity ?? 0,
        })),
      );
      cart.subTotal = totals.subTotal;
      cart.shipping = totals.shipping;
      cart.total = totals.total;
    }

    await cart.save();
    await cart.populate("items.product");
    logger.info("Item added to cart", cart);
    return res
      .status(200)
      .json({ success: true, message: "Item added to cart", cart });
  } catch (err) {
    logger.error("Failed to add item to cart", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateCart = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id: productId } = req.params; // ✅ Use 'id' from route parameter
  const { quantity } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!productId || Array.isArray(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  try {
    // ✅ Convert IDs to ObjectId for accurate matching
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const cart = await Cart.findOne({
      user: userObjectId,
      "items.product": productObjectId,
    });
    if (!cart) return res.status(404).json({ message: "Cart item not found" });

    cart.items = cart.items ?? [];
    // ✅ Use toString() for comparison
    const item = cart.items.find((it) => it.product.toString() === productId);
    if (!item) return res.status(404).json({ message: "Cart item not found" });

    item.quantity = Number(quantity);
    const totals = calculateTotals(
      cart.items.map((it) => ({ price: it.price, quantity: it.quantity ?? 0 })),
    );
    cart.subTotal = totals.subTotal;
    cart.shipping = totals.shipping;
    cart.total = totals.total;

    await cart.save();
    await cart.populate("items.product");
    logger.info("Item in cart updated:", cart);
    return res.status(200).json({ success: true, cart });
  } catch (err) {
    logger.error("Failed to update cart item", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const removeItem = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id: productId } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!productId || Array.isArray(productId)) {
    return res.status(400).json({ message: "Invalid product id" });
  }

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const cart = await Cart.findOneAndUpdate(
      { user: userObjectId },
      { $pull: { items: { product: productObjectId } } },
      { new: true },
    ).populate("items.product");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items ?? [];
    const totals = calculateTotals(
      cart.items.map((it) => ({ price: it.price, quantity: it.quantity ?? 0 })),
    );
    cart.subTotal = totals.subTotal;
    cart.shipping = totals.shipping;
    cart.total = totals.total;
    await cart.save();
    logger.info("Item removed from cart");
    return res.status(200).json({ success: true, cart });
  } catch (err) {
    logger.error("Failed to remove item from cart", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getItems = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const cart = await Cart.findOne({ user: userObjectId }).populate(
      "items.product",
    );
    if (!cart || (Array.isArray(cart.items) && cart.items.length === 0)) {
      return res
        .status(200)
        .json({ success: true, cart: null, message: "No items in cart" });
    }

    return res.status(200).json({ success: true, cart });
  } catch (err) {
    logger.error("Failed to fetch cart items", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
