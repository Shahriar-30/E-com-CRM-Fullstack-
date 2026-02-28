import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    otp: String,
    otpExpiration: Date,
  },
  { timestamps: true }
);

export const Otp = mongoose.model("Otp", otpSchema);
