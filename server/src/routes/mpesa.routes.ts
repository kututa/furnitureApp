import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { callBack } from "../services/callback";
import { mpesaController } from "../services/mpesa.controller";

const router = Router();

// poll transaction + order (if created)
router.get("/transaction/:id", authenticate, mpesaController.getTransaction);
router.get("/transactions", mpesaController.getTransactions);
router.post("/callback", callBack);
export default router;
