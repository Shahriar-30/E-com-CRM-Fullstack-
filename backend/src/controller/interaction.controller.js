import mongoose from "mongoose";
import { Interaction } from "../models/interaction.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getInteractions = asyncHandler(async (req, res) => {
  const { customerId } = req.query;

  if (!customerId) {
    throw new apiError(400, "Customer ID is required to fetch interactions");
  }

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new apiError(400, "Invalid customer ID");
  }

  const interactions = await Interaction.find({ customerId }).sort({
    createdAt: -1,
  });

  res
    .status(200)
    .json(new apiRes(200, interactions, "Interactions retrieved successfully"));
});

export const createInteraction = asyncHandler(async (req, res) => {
  const { customerId, type, channel, notes } = req.body;

  if (!customerId || !type || !channel || !notes) {
    throw new apiError(
      400,
      "All fields (customerId, type, channel, notes) are required"
    );
  }

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new apiError(400, "Invalid customer ID");
  }

  const interaction = await Interaction.create({
    customerId,
    type,
    channel,
    notes,
  });

  res
    .status(201)
    .json(new apiRes(201, interaction, "Interaction logged successfully"));
});

export const deleteInteraction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid interaction ID");
  }

  const interaction = await Interaction.findByIdAndDelete(id);

  if (!interaction) {
    throw new apiError(404, "Interaction not found");
  }

  res
    .status(200)
    .json(new apiRes(200, null, "Interaction deleted successfully"));
});
