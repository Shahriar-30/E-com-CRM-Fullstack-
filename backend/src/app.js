import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";

export const app = express();

// helper middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==== = routes imports = ====

// routes

// global error handeler
app.use(errorMiddleware);
