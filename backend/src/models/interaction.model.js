import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Interaction customer id is required"],
    },
    type: {
      type: String,
      required: [true, "Interaction type is required"],
      enum: ["call", "email", "chat", "metting"],
    },
    channel: {
      type: String,
      required: [true, "Interaction channel is required"],
      enum: ["phone", "whatsapp", "email", "live chat", "meta-messanger"],
    },
    notes: {
      type: String,
      required: [true, "Interaction notes is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

export const Interaction = mongoose.model("Interaction", interactionSchema);
