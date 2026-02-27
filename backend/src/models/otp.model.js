import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    user: mongoose.Schema.Types.ObjectId,
    otp: String,
    otpExpiration: Date,
  },
  { timestamps: true }
);

export const OTP = mongoose.model("Otp", otpSchema);
