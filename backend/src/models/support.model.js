import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Support customer id is required"],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Support order is required"],
    },
    subject: {
      type: String,
      required: [true, "Support subject is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      required: [true, "Support priority is required"],
    },
    messages: {
      type: String,
      trim: true,
      required: [true, "Support message is required"],
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Support = mongoose.model("Support", supportSchema);
