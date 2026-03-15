import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import { startSegmentCron } from "./utils/corn.js";
import { runSegmentEngine } from "./controller/segment.controller.js";

export const app = express();

// corn
startSegmentCron(runSegmentEngine);

// helper middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==== = routes imports = ====
import { userRouter } from "./routes/user.route.js";
import { customerRouter } from "./routes/customer.route.js";
import { orderRouter } from "./routes/order.route.js";
import { productRouter } from "./routes/product.route.js";
import { orderItemRouter } from "./routes/orderitem.route.js";
import { couponRouter } from "./routes/coupon.route.js";
import { segmentRouter } from "./routes/segment.route.js";
// routes

app.use("/api/v1/users", userRouter);
app.use("/api/v1/customer", customerRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/orderitem", orderItemRouter);
app.use("/api/v1/coupon", couponRouter);
app.use("/api/v1/segment", segmentRouter);

// global error handeler
app.use(errorMiddleware);
