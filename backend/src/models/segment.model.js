import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
      enum: ["totalSpent", "orderCount"],
    },
    operator: {
      type: String,
      required: true,
      enum: ["gt", "lt", "gte", "lte"],
    },
    value: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const segmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["new", "loyal", "at-risk", "vip"],
      required: true,
    },

    rules: {
      type: ruleSchema,
      required: true,
    },

    customerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],
    count: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

segmentSchema.pre("save", function (next) {
  this.count = this.customerIds.length;
  return;
});

export const Segment = mongoose.model("Segment", segmentSchema);
