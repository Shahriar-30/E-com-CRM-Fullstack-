import express from "express";
import {
  getAnalytics,
  refreshAnalytics,
} from "../controller/analytics.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const analyticsRouter = express.Router();

analyticsRouter.use(authMiddleware);

analyticsRouter.route("/").get(getAnalytics);
analyticsRouter.route("/calculate").post(refreshAnalytics);
