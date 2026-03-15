import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createCoupon,
  deleteCouponById,
  editCouponById,
  getCoupon,
  getCouponById,
  isValidCoupon,
} from "../controller/coupon.controller.js";

export const couponRouter = express.Router();

// global route
couponRouter.use(authMiddleware);

// local route
couponRouter.route("/createcoupon").post(createCoupon);
couponRouter.route("/getcoupon").get(getCoupon);

couponRouter
  .route("/couponmodify/:id")
  .get(getCouponById)
  .put(editCouponById)
  .delete(deleteCouponById);
couponRouter.route("/isvalid").get(isValidCoupon);
