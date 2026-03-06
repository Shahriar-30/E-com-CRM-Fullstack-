import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Customer } from "../models/customer.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Order } from "../models/order.models.js";
import { apiRes } from "../utils/apiRes.js";

export const createOrder = asyncHandler(async (req, res) => {
  let { customerId, couponCode, subTotal, paymentMethod, shippingAddress } =
    req.body;
  if (!customerId || !subTotal || !paymentMethod || !shippingAddress)
    throw new apiError(400, "Required fields are missing");

  if (!mongoose.Types.ObjectId.isValid(customerId))
    throw new apiError(400, "Invalid customer Id");

  let customer = await Customer.findById(customerId);
  if (!customer) throw new apiError(404, "Customer not found");

  let couponId = null;
  let coupon_discount = 0;

  if (couponCode) {
    let coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) throw new apiError(404, "Invalid coupon code");

    if (!coupon.isActive) throw new apiError(400, "Coupon is not active");

    if (subTotal < minOrderValue)
      throw new apiError(400, `Minimum order value is ${coupon.minOrderValue}`);

    if (coupon.usedCount >= coupon.maxUser)
      throw new apiError(400, "Coupon usage limit reached");

    if (coupon.expiresAt && coupon.expiresAt < new Date.now())
      throw new apiError(400, "Coupon has expired");
    // calculation
    if (coupon.discountType === "percentage")
      coupon_discount = (subTotal * coupon.discountValue) / 100;
    if (coupon.discountType === "flat") coupon_discount = coupon.discountValue;

    couponId = coupon._id;
    coupon.usedCount += 1;

    await coupon.save();
  }

  const total = subTotal - coupon_discount;

  const order = await Order.create({
    customerId,
    couponId,
    subTotal,
    discount: coupon_discount,
    total,
    paymentMethod,
    shippingAddress,
  });

  res.status(201).json(new apiRes(201, order, "Order created successfully"));
});
