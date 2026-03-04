import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }

    const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedUser) throw new apiError(401, "Invalid access token to verify");

    const user = await User.findById(decodedUser._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new apiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err?.message || "Invalid access token",
    });
  }
};
