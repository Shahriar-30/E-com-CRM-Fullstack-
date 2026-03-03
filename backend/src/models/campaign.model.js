import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    segmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Segment",
      required: [true, "Campaign segment id is required"],
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: [true, "Campaign coupon is required"],
    },
    name: {
      type: String,
      required: [true, "Campain name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Campaign type is required"],
      enum: ["welcome", "win-back", "promotional", "abandoned cart"],
    },
    channel: {
      type: String,
      required: [true, "Campaign channel is reqired"],
      enum: ["email", "sms"],
    },
    state: {
      type: String,
      enum: ["draft", "scheduled", "sent"],
      default: "draft",
    },
    sentCount: Number,
    scheduledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model("Campaign", campaignSchema);
