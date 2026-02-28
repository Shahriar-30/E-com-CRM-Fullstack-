import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: [true, "Order item quantity is required"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Order item unit price is required"],
    },
    lineTotal: {
      type: Number,
      required: [true, "Order item total is required"],
    },
  },
  { timestamps: true }
);

orderItemSchema.pre("save", function (next) {
  this.lineTotal = this.quantity * this.unitPrice;
  next();
});

export const OrderItem = mongoose.model("OrderItem", orderItemSchema);
