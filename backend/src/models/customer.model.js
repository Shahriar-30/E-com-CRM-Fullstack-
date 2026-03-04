import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "User name is required"],
      trim: true,
      minlength: [2, "User should have min length of 2 charactor"],
    },
    email: {
      type: String,
      require: [true, "E-Mail is required"],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid E-Mail",
      ],
    },
    phone: {
      type: Number,
      unique: true,
      trim: true,
    },
    totalSpent: {
      type: Number,
      default: 0,
      trim: true,
    },
    orderCount: {
      type: Number,
      default: 0,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "loyal", "at-risk", "vip"],
      default: "new",
    },
    source: {
      type: String,
      trim: true,
    },
    emailSettings: {
      subscribed: true,
      welcomeSent: false,
      marketingEmails: true,
      transactionalEmails: true,
      lastEmailSentAt: Date,
      unsubscribedAt: Date,
    },
    lastOrderAt: Date,
    totalOrders: [Date],
  },
  { timestamps: true }
);

export const Customer = mongoose.model("Customer", customerSchema);
