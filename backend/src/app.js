import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

export const app = express();

// helper middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==== = routes imports = ====
import { userRouter } from "./routes/user.route.js";
import { customerRouter } from "./routes/customer.route.js";
// routes

app.use("/api/v1/users", userRouter);
app.use("/api/v1/customer", customerRouter);

// global error handeler
app.use(errorMiddleware);
