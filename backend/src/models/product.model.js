import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    // unique product code for inventory
    sku: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },
    category: {
      type: String,
      enum: ["tshirt", "jeans", "polo shirt"],
      required: [true, "Product category is required"],
    },
    stock: {
      type: Number,
      required: [true, "Product stoke is required"],
    },
    tags: {
      type: [String],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product createdBy is required"],
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
