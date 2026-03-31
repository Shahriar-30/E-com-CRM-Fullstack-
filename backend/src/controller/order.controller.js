import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Customer } from "../models/customer.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Order } from "../models/order.models.js";
import { OrderItem } from "../models/orderItem.model.js";
import { apiRes } from "../utils/apiRes.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  generateOrderConfirmationEmail,
  generateWelcomeEmail,
} from "../utils/emailTemplates.js";

export const createOrder = asyncHandler(async (req, res) => {
  let { customerId, couponCode, subTotal, paymentMethod, shippingAddress } =
    req.body;
  if (!customerId || !subTotal || !paymentMethod || !shippingAddress)
    throw new apiError(400, "Required fields are missing");

  if (!mongoose.Types.ObjectId.isValid(customerId))
    throw new apiError(400, "Invalid customer Id");

  let customer = await Customer.findOne({
    _id: customerId,
    createdBy: req.user._id,
  });
  if (!customer) throw new apiError(404, "Customer not found or access denied");

  let couponId = null;
  let coupon_discount = 0;

  if (couponCode) {
    let coupon = await Coupon.findOne({
      code: couponCode,
      createdBy: req.user._id,
    });
    if (!coupon) throw new apiError(404, "Invalid coupon code");

    if (!coupon.isActive) throw new apiError(400, "Coupon is not active");

    if (subTotal < coupon.minOrderValue)
      throw new apiError(400, `Minimum order value is ${coupon.minOrderValue}`);

    if (coupon.maxUser && coupon.usedCount >= coupon.maxUser)
      throw new apiError(400, "Coupon usage limit reached");

    if (coupon.expiresAt && coupon.expiresAt < new Date())
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

  // Update customer stats
  customer.orderCount += 1;
  customer.totalSpent += total;
  customer.lastOrderAt = new Date();
  await customer.save();

  const order = await Order.create({
    customerId,
    couponId,
    subTotal,
    discount: coupon_discount,
    total,
    paymentMethod,
    shippingAddress,
  });

  // --- Email Logic (Fire and Forget) ---
  try {
    const emailSettings = customer.emailSettings || {};

    // 1. Transactional: Order Confirmation (Respect transactionalEmails flag, default true)
    if (emailSettings.transactionalEmails !== false) {
      const { subject, html } = generateOrderConfirmationEmail(
        customer.name,
        order._id,
        total
      );
      await sendEmail(
        null,
        customer.email,
        subject,
        "Order Confirmation",
        html
      );
    }

    // 2. Marketing: Welcome Email (If first order AND marketing allowed)
    // We just incremented orderCount, so if it is 1, this is the first order.
    if (
      customer.orderCount === 1 &&
      !emailSettings.welcomeSent &&
      emailSettings.marketingEmails !== false
    ) {
      const { subject, html } = generateWelcomeEmail(customer.name);
      await sendEmail(null, customer.email, subject, "Welcome!", html);

      // Update welcomeSent flag
      customer.emailSettings.welcomeSent = true;
      customer.emailSettings.lastEmailSentAt = new Date();
      // We need to save again to persist the email flag change
      await customer.save({ validateBeforeSave: false });
    }
  } catch (emailError) {
    // Log error but don't fail the order creation
    console.error("Failed to send order emails:", emailError);
  }

  res.status(201).json(new apiRes(201, order, "Order created successfully"));
});

export const getOrderById = asyncHandler(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, "Invalid order id");

  const order = await Order.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(id) },
    },
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customer_details",
      },
    },
    {
      $unwind: "$customer_details",
    },
    {
      $match: {
        "customer_details.createdBy": new mongoose.Types.ObjectId(req.user._id),
      },
    },
  ]);
  if (!order.length) throw new apiError(404, "Order not found");

  res.json(order);
});

export const getOrderByStatus = asyncHandler(async (req, res) => {
  let { status } = req.query;
  if (!status) throw new apiError(400, "Order status is missing");

  const myCustomers = await Customer.find({ createdBy: req.user._id }).select(
    "_id"
  );
  const myCustomerIds = myCustomers.map((c) => c._id);

  const query = { customerId: { $in: myCustomerIds } };
  if (status && status.toLowerCase() !== "all") {
    query.status = status;
  }

  const orders = await Order.find(query).sort({ createdAt: -1 });

  res
    .status(200)
    .json(
      new apiRes(200, orders, "Orders found successfully according to status")
    );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, "Invalid order id");

  let { status } = req.query;
  if (!status) throw new apiError(400, "Order status is missing");

  const orderCheck = await Order.findById(id).populate("customerId");
  if (
    !orderCheck ||
    !orderCheck.customerId ||
    orderCheck.customerId.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new apiError(404, "Order not found");
  }

  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) throw new apiError(404, "Order not found");

  res
    .status(200)
    .json(new apiRes(200, order, "Order status updated successfully"));
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid order id");
  }

  const order = await Order.findById(id);
  if (!order) {
    throw new apiError(404, "Order not found");
  }

  // Revert customer stats
  const customer = await Customer.findOne({
    _id: order.customerId,
    createdBy: req.user._id,
  });
  if (!customer) throw new apiError(404, "Order not found or access denied");

  customer.orderCount -= 1;
  customer.totalSpent -= order.total;
  await customer.save({ validateBeforeSave: false });

  // Revert coupon usage
  if (order.couponId) {
    const coupon = await Coupon.findById(order.couponId);
    if (coupon) {
      coupon.usedCount -= 1;
      await coupon.save({ validateBeforeSave: false });
    }
  }

  // Delete associated order items
  await OrderItem.deleteMany({ orderId: id });

  // Delete the order itself
  await Order.findByIdAndDelete(id);

  res.status(200).json(new apiRes(200, null, "Order deleted successfully"));
});
