import { Router } from "express";
import { initiatePayment, makeOrder, getBuyersOrders, getSellersOrders, updateStatus, cancelOrder } from "../controllers/order.controller";
import { validate, schemas } from "../middleware/validator";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/buyer/:id", authenticate, getBuyersOrders);
router.get("/seller/:id", authenticate, getSellersOrders);

// new initiate-payment (mpesa only)
router.post("/initiate-payment", authenticate, validate(schemas.makeOrder), initiatePayment);

// keep but disabled (returns 405)
router.post("/", authenticate, validate(schemas.makeOrder), makeOrder);

router.put("/:id", updateStatus);
router.put("/cancel/:id", authenticate, cancelOrder);

export default router;