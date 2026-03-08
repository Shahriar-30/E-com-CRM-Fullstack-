import express from "express";
import {
  createOrderItem,
  deleteOrderItems,
  getOrderItems,
} from "../controller/orderItem.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const orderItemRouter = express.Router();

// global route
orderItemRouter.use(authMiddleware);

// local routes
orderItemRouter.route("/createorderitem").post(createOrderItem);
orderItemRouter
  .route("/orderitemmodify")
  .get(getOrderItems)
  .delete(deleteOrderItems);
