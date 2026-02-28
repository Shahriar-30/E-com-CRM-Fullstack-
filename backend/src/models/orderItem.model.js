import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order item order id is required"],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Order item product id is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Order item quantity is required"],
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: [true, "Order item unit price is required"],
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: [true, "Order item total is required"],
    },
  },
  { timestamps: true }
);

orderItemSchema.pre("validate", function (next) {
  this.lineTotal = this.quantity * this.unitPrice;
  next();
});

export const OrderItem = mongoose.model("OrderItem", orderItemSchema);
