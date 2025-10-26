import { Router } from "express";
import { mpesaController } from "../services/mpesa.controller";
import { authenticate } from "../middleware/auth";
import {callBack} from "../services/callback"

const router = Router();

// poll transaction + order (if created)
router.get("/transaction/:id", authenticate, mpesaController.getTransaction);
router.post("/callback", callBack);
export default router;