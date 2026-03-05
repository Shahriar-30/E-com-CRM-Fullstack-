import mongoose from "mongoose";
import { Customer } from "../models/customer.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const findCustomer = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    status,
    minSpent,
    maxSpent,
    minOrder,
    maxOrder,
    search,
  } = req.query;

  let query = {};

  if (status) query.status = status;

  if (minSpent || maxSpent) {
    query.totalSpent = {};
    if (minSpent) {
      query.totalSpent.$gte = Number(minSpent);
    }
    if (maxSpent) {
      query.totalSpent.$lte = Number(maxSpent);
    }
  }

  if (minOrder || maxOrder) {
    query.orderCount = {};
    if (minOrder) {
      query.orderCount.$gte = Number(minOrder);
    }
    if (maxOrder) {
      query.orderCount.$lte = Number(maxOrder);
    }
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  let allCustomer = await Customer.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  let total = await Customer.countDocuments(query);

  res
    .status(200)
    .json(
      new apiRes(200, { allCustomer, total }, "Got all customer successfully")
    );
});

export const createCustomer = asyncHandler(async (req, res) => {
  let { name, email, phone, source } = req.body;

  if (!name || !email) throw new apiError(400, "Name or E-Mail is required");

  let user = await Customer.findOne({ email });
  if (user) throw new apiError(400, "Customer with E-Mail already exists");

  if (phone) {
    let user = await Customer.findOne({ phone });
    if (user)
      throw new apiError(400, "Customer with phone number already exists");
  }

  const customer = await Customer.create({ name, email, phone, source });

  res
    .status(201)
    .json(new apiRes(201, customer, "Customer created successfully"));
});

// controllers by id
export const getCustomerById = asyncHandler(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, "Invalid customer id");

  let customer = await Customer.findById(id);
  if (!customer) throw new apiError(404, "Customer not found");

  res
    .status(200)
    .json(new apiRes(200, customer, "Found customer successfully"));
});

export const deleteCustomerById = asyncHandler(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, "Invalid customer id");

  let customer = await Customer.findByIdAndDelete(id);
  if (!customer) throw new apiError(404, "Customer not found");

  res
    .status(200)
    .json(new apiRes(200, customer, "Customer deleted successfully"));
});

export const updateCustomerById = asyncHandler(async (req, res) => {
  let { id } = req.params;
  let { dataObj } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new apiError(400, "Invalid customer id");

  if (!dataObj) throw new apiError(400, "No reasoure found to update customer");

  let customer = await Customer.findByIdAndUpdate(id, dataObj, { new: true });
  if (!customer) throw new apiError(404, "Customer not found");

  res
    .status(200)
    .json(new apiRes(200, customer, "Updated the customer successfully"));
});
