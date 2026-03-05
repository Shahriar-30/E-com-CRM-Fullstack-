import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createCustomer,
  deleteCustomerById,
  findCustomer,
  getCustomerById,
  updateCustomerById,
} from "../controller/customer.controller.js";

export const customerRouter = express.Router();

// global route
customerRouter.use(authMiddleware);

// other route
customerRouter.route("/createcustomer").post(createCustomer);
customerRouter.route("/findcustomer").get(findCustomer);
customerRouter
  .route("/customermodify/:id")
  .get(getCustomerById)
  .delete(deleteCustomerById)
  .put(updateCustomerById);
