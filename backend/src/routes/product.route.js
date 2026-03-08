import express from "express";
import {
  createProduct,
  deleteProductById,
  getProduct,
  getProductById,
  updateProductById,
} from "../controller/product.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const productRouter = express.Router();

// global route
productRouter.use(authMiddleware);

// local route
productRouter.route("/createproduct").post(createProduct);
productRouter.route("/getproduct").get(getProduct);

productRouter
  .route("/productmodify/:id")
  .get(getProductById)
  .put(updateProductById)
  .delete(deleteProductById);
