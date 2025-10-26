import { Router } from "express";

import { addToCart, getItems, removeItem, updateCart } from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth";
import { schemas, validate } from "../middleware/validator";

const router = Router()


router.get("/", authenticate,  getItems)
router.post("/", authenticate, validate(schemas.addToCart), addToCart)
router.put("/:id", authenticate,  updateCart)
router.delete("/:id", authenticate, removeItem)


export default router