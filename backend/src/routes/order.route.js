import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createOrder } from "../controller/order.controller.js";

export const orderRouter = express.Router();

// global route
orderRouter.use(authMiddleware);

// local route
orderRouter.route("/createorder").post(createOrder);
