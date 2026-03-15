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
    messages: [
      {
        sender: { type: String, enum: ["customer", "agent"], required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Support = mongoose.model("Support", supportSchema);
