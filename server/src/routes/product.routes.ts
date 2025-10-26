import { Router } from "express";

import {
	addProduct,
	deleteProduct,
	getListingsBySeller,
	getProduct,
	getProducts,
	updateProduct,
	updateStock
} from "../controllers/product.controller";
import { authenticate } from "../middleware/auth";
import { multerUpload } from "../middleware/multer";
import { schemas, validateWithFile } from "../middleware/validator";

const router = Router();

router.get("/listing/:sellerId", getListingsBySeller)

router.get("/",  getProducts);
router.get("/:id", getProduct);


router.post(
	"/",
	authenticate,
	multerUpload.single("image"),
	validateWithFile(schemas.addProduct, false),
	addProduct
);

router.put(
	"/:id",
	authenticate,
	multerUpload.single("image"),
	validateWithFile(schemas.updateProduct, false),
	updateProduct
);

router.put("/:id/stock", updateStock)
router.delete("/:id", authenticate, deleteProduct)

export default router