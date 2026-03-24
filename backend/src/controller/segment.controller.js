import mongoose from "mongoose";
import { Customer } from "../models/customer.model.js";
import { Segment } from "../models/segment.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createSegment = asyncHandler(async (req, res) => {
  const { name, rules, customerIds } = req.body;

  if (!name || !rules) {
    throw new apiError(400, "Name and rules are required");
  }

  const segment = await Segment.create({
    name,
    rules,
    customerIds: customerIds || [],
    createdBy: req.user._id,
  });

  res
    .status(201)
    .json(new apiRes(201, segment, "Segment created successfully"));
});

export const getSegments = asyncHandler(async (req, res) => {
  const segments = await Segment.find({ createdBy: req.user._id }).sort({
    createdAt: -1,
  });

  res
    .status(200)
    .json(new apiRes(200, segments, "Segments fetched successfully"));
});

export const updateSegment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, rules } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid segment id");
  }

  const segment = await Segment.findOneAndUpdate(
    { _id: id, createdBy: req.user._id },
    { name, rules },
    { new: true }
  );

  if (!segment) {
    throw new apiError(404, "Segment not found");
  }

  res
    .status(200)
    .json(new apiRes(200, segment, "Segment updated successfully"));
});

export const deleteSegment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid segment id");
  }

  const segment = await Segment.findOneAndDelete({
    _id: id,
    createdBy: req.user._id,
  });

  if (!segment) {
    throw new apiError(404, "Segment not found");
  }

  res.status(200).json(new apiRes(200, null, "Segment deleted successfully"));
});

export const runSegmentEngine = async (req, res) => {
  const segments = await Segment.find();

  for (const segment of segments) {
    const { field, operator, value } = segment.rules;

    const operatorMap = {
      gt: "$gt",
      lt: "$lt",
      gte: "$gte",
      lte: "$lte",
    };

    const query = {
      [field]: {
        [operatorMap[operator]]: value,
      },
      createdBy: segment.createdBy,
    };

    const customers = await Customer.find(query).select("_id");

    const customerIds = customers.map((c) => c._id);

    await Segment.findByIdAndUpdate(segment._id, {
      customerIds,
      count: customerIds.length,
    });
  }

  if (res) {
    res
      .status(200)
      .json(new apiRes(200, null, "Segment engine ran successfully"));
  }
};
