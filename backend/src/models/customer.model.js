import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
      minlength: [2, "User should have min length of 2 characters"],
    },

    email: {
      type: String,
      required: [true, "E-Mail is required"],
      unique: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid E-Mail",
      ],
    },

    phone: {
      type: String,
      unique: true,
      trim: true,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    orderCount: {
      type: Number,
      default: 0,
    },
    source: {
      type: String,
      trim: true,
    },

    emailSettings: {
      subscribed: { type: Boolean, default: true },
      welcomeSent: { type: Boolean, default: false },
      marketingEmails: { type: Boolean, default: true },
      transactionalEmails: { type: Boolean, default: true },
      lastEmailSentAt: Date,
      unsubscribedAt: Date,
    },

    lastOrderAt: Date,
  },
  { timestamps: true }
);

export const Customer = mongoose.model("Customer", customerSchema);
