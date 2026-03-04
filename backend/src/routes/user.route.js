import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export let userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
// protected routes
userRouter.route("/logout").post(authMiddleware, logoutUser);
