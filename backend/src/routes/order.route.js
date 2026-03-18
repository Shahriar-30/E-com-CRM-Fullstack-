import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  getOrderById,
  getOrderByStatus,
  updateOrderStatus,
  deleteOrder,
} from "../controller/order.controller.js";

export const orderRouter = express.Router();

// global route
orderRouter.use(authMiddleware);

// local route
orderRouter.route("/createorder").post(createOrder);
orderRouter.route("/getorderbystatus").get(getOrderByStatus);
orderRouter
  .route("/ordermodify/:id")
  .get(getOrderById)
  .post(updateOrderStatus)
  .delete(deleteOrder);
