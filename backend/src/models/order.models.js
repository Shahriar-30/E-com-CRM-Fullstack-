import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Customer ID is required"],
      ref: "Customer",
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
    },
    // total before discount
    subTotal: {
      type: Number,
    },
    discount: Number,
    total: {
      type: Number,
      required: [true, "Order total amount is required"],
    },
    paymentMethod: {
      type: String,
      enum: ["card", "mfs", "cash on delivery"],
      required: [true, "Payment method is required"],
    },
    shippingAddress: {
      type: String,
      required: [true, "Shipping address is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
