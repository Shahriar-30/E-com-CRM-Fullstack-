import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createProduct = asyncHandler(async (req, res) => {
  let { name, sku, price, category, stock, tags } = req.body;
  if (!name || !price || !category || !stock)
    throw new apiError(400, "Required fields are missing");

  let createdBy = req.user._id;

  let product = await Product.create({
    name,
    sku,
    price,
    category,
    stock,
    tags,
    createdBy,
  });

  res
    .status(201)
    .json(new apiRes(201, product, "Product created successfully"));
});

export const getProduct = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, query } = req.query;

  page = Number(page);
  limit = Number(limit);

  let searchQuery = { createdBy: req.user._id };

  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
    ];
  }

  const allProducts = await Product.find(searchQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new apiRes(200, allProducts, "Products found successfully"));
});

export const getProductById = asyncHandler(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, "Invalid product id");

  let product = await Product.findOne({
    _id: id,
    createdBy: req.user._id,
  }).populate("createdBy");
  if (!product) throw new apiError(404, "Product not found");

  res.status(200).json(new apiRes(200, product, "Product found successfully"));
});

export const updateProductById = asyncHandler(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, "Invalid product id");

  let { updateData } = req.body;
  if (!updateData) throw new apiError(400, "Product update data is required");

  let product = await Product.findOneAndUpdate(
    { _id: id, createdBy: req.user._id },
    updateData,
    { new: true }
  );
  if (!product) throw new apiError(404, "Product not found");

  res
    .status(200)
    .json(new apiRes(200, product, "Product updated successfully"));
});

export const deleteProductById = asyncHandler(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, "Invalid product id");

  let product = await Product.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });
  if (!product) throw new apiError(404, "Product not found");

  res
    .status(200)
    .json(new apiRes(200, product, "Product deleted successfully"));
});
