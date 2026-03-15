import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { OrderItem } from "../models/orderItem.model.js";
import { apiRes } from "../utils/apiRes.js";
import { Product } from "../models/product.model.js";

export const createOrderItem = asyncHandler(async (req, res) => {
  let { orderId, productId, quantity } = req.body;
  if (!orderId || !productId || !quantity)
    throw new apiError(400, "Required fields are missing");

  if (!mongoose.Types.ObjectId.isValid(orderId))
    throw new apiError(400, "Invalid order id");
  if (!mongoose.Types.ObjectId.isValid(productId))
    throw new apiError(400, "Invalid product id");

  let product = await Product.findById(productId);
  if (!product) throw new apiError(404, "Product not found");

  if (product.stock < quantity) throw new apiError(400, "Stoke not available");

  let unitPrice = product.price;

  product.stock -= quantity;
  await product.save();

  let orderItem = await OrderItem.create({
    orderId,
    productId,
    quantity,
    unitPrice,
  });

  res
    .status(201)
    .json(new apiRes(201, orderItem, "Order item created successfully"));
});

export const getOrderItems = asyncHandler(async (req, res) => {
  const { orderId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new apiError(400, "Invalid order id");
  }

  const orderItems = await OrderItem.find({ orderId }).populate([
    "orderId",
    "productId",
  ]);

  if (orderItems.length === 0) {
    throw new apiError(404, "Order items not found");
  }

  res
    .status(200)
    .json(new apiRes(200, orderItems, "Order items fetched successfully"));
});

export const deleteOrderItems = asyncHandler(async (req, res) => {
  const { orderId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new apiError(400, "Invalid order id");
  }

  const deletedItems = await OrderItem.deleteMany({ orderId });

  if (deletedItems.deletedCount === 0) {
    throw new apiError(404, "Order items not found");
  }

  res
    .status(200)
    .json(new apiRes(200, deletedItems, "Order items deleted successfully"));
});
