import { Router } from "express";
import { cancelOrder, getBuyersOrders, getSellersOrders, initiatePayment, makeOrder, updateStatus } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth";
import { schemas, validate } from "../middleware/validator";

const router = Router();

router.get("/buyer/:id", authenticate, getBuyersOrders);
router.get("/seller/:id", authenticate, getSellersOrders);

// new initiate-payment (mpesa only)
router.post("/initiate-payment", authenticate, validate(schemas.makeOrder), initiatePayment);

// keep but disabled (returns 405)
router.post("/", authenticate, validate(schemas.makeOrder), makeOrder);

router.put("/:id", authenticate, updateStatus);
router.put("/cancel/:id", authenticate, cancelOrder);

export default router;