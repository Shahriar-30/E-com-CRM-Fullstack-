import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createCustomer } from "../controller/customer.controller.js";

export const customerRouter = express.Router();

// global route
customerRouter.use(authMiddleware);

// other route
customerRouter.route("/createcustomer").post(createCustomer);
