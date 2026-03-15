import mongoose from "mongoose";
import { Coupon } from "../models/coupon.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCoupon = asyncHandler(async (req, res) => {
  let { code, discountType, discountValue, minOrderValue, maxUser, expiresAt } =
    req.body;

  if (!code || !discountType || !discountValue)
    throw new apiError(400, "Required fields are missing");

  let ifCoupon = await Coupon.findOne({ code });
  if (ifCoupon) throw new apiError(400, "Coupon code already exists");

  let coupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    minOrderValue,
    maxUser,
    expiresAt,
  });

  res.status(201).json(new apiRes(201, coupon, "Coupon created successfully"));
});

export const getCoupon = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, query } = req.query;

  page = Number(page);
  limit = Number(limit);

  let searchQuery = {};

  if (query) {
    searchQuery = {
      $or: [{ code: { $regex: query, $options: "i" } }],
    };
  }

  const coupons = await Coupon.find(searchQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  if (coupons.length === 0) {
    throw new apiError(404, "Coupon not found");
  }

  res.status(200).json({
    success: true,
    message: "Coupon found successfully",
    data: coupons,
  });
});

export const getCouponById = asyncHandler(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, "Invalid coupon id");

  let coupon = await Coupon.findById(id);
  if (!coupon) throw new apiError(404, coupon, "Coupon not found");

  res.status(200).json(new apiRes(200, coupon, "Coupon found successfully"));
});

export const editCouponById = asyncHandler(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, "Invalid coupon id");

  let { editValue } = req.body;
  if (!editValue) throw new apiError(400, "Edit value is required");

  let coupon = await Coupon.findByIdAndUpdate(id, editValue, { new: true });
  if (!coupon) throw new apiError(404, "Coupon not found");

  res.status(200).json(new apiRes(200, coupon, "Coupon update successfully"));
});

export const deleteCouponById = asyncHandler(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, "Invalid coupon id");

  let coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw new apiError(404, "Coupon not found");

  res.status(200).json(new apiRes(200, coupon, "Coupon deleted successfully"));
});

export const isValidCoupon = asyncHandler(async (req, res) => {
  let { code, subTotal } = req.query;
  if (!code) throw new apiError(400, "Coupon code is required");

  let coupon = await Coupon.findOne({ code });
  if (!coupon) throw new apiError(404, "Invalid coupon code");

  if (!coupon.isActive) throw new apiError(400, "Coupon is not active");

  if (subTotal && Number(subTotal) < coupon.minOrderValue)
    throw new apiError(400, `Minimum order value is ${coupon.minOrderValue}`);

  if (coupon.usedCount >= coupon.maxUser)
    throw new apiError(400, "Coupon usage limit reached");

  if (coupon.expiresAt && coupon.expiresAt < new Date())
    throw new apiError(400, "Coupon has expired");

  res.status(200).json(new apiRes(200, coupon, "Coupon code is valid"));
});
