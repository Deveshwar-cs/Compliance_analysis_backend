import express from "express";
import {upload} from "../middlewares/multer.js";
import {
  createProduct,
  getAllProducts,
  getProductsByCompany,
} from "../controller/product.controller.js";
import protect, {isUser} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/create",
  protect,
  upload.array("images", 5),
  isUser,
  createProduct,
);

router.get("/get-by-company/:companyId", protect, getProductsByCompany);
router.get("/get-products", protect, getAllProducts);

export default router;
