import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      trim: true,
    },
    discountType: {
      type: String,
      required: [true, "Discount type is required"],
      enum: ["percentage", "flat"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
    },
    minOrderValue: {
      type: Number,
      default: 0,
    },
    maxUser: Number,
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: Date,
  },
  { timestamps: true }
);

export const Coupon = mongoose.model("Coupon", couponSchema);
