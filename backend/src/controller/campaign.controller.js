import mongoose from "mongoose";
import { Campaign } from "../models/campaign.model.js";
import { Segment } from "../models/segment.model.js";
import { Coupon } from "../models/coupon.model.js";
import { Customer } from "../models/customer.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateCampaignEmail } from "../utils/emailTemplates.js";

export const getCampaigns = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const query = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const campaigns = await Campaign.find(query)
    .populate("segmentId", "name")
    .populate("couponId", "code")
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Campaign.countDocuments(query);

  res
    .status(200)
    .json(
      new apiRes(200, { campaigns, total }, "Campaigns fetched successfully")
    );
});

export const createCampaign = asyncHandler(async (req, res) => {
  const { name, type, channel, segmentId, couponId, scheduledAt } = req.body;

  if (!name || !type || !channel || !segmentId || !couponId) {
    throw new apiError(400, "All fields are required");
  }

  if (!mongoose.Types.ObjectId.isValid(segmentId)) {
    throw new apiError(400, "Invalid segment ID");
  }
  const segment = await Segment.findById(segmentId);
  if (!segment) throw new apiError(404, "Segment not found");

  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new apiError(400, "Invalid coupon ID");
  }
  const coupon = await Coupon.findById(couponId);
  if (!coupon) throw new apiError(404, "Coupon not found");

  const campaign = await Campaign.create({
    name,
    type,
    channel,
    segmentId,
    couponId,
    scheduledAt,
  });

  res
    .status(201)
    .json(new apiRes(201, campaign, "Campaign created successfully"));
});

export const updateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid campaign ID");
  }

  const campaign = await Campaign.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!campaign) {
    throw new apiError(404, "Campaign not found");
  }

  res
    .status(200)
    .json(new apiRes(200, campaign, "Campaign updated successfully"));
});

export const deleteCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid campaign ID");
  }

  const campaign = await Campaign.findByIdAndDelete(id);

  if (!campaign) {
    throw new apiError(404, "Campaign not found");
  }

  res.status(200).json(new apiRes(200, null, "Campaign deleted successfully"));
});

export const sendCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid campaign ID");
  }

  const campaign = await Campaign.findById(id).populate("couponId");
  if (!campaign) throw new apiError(404, "Campaign not found");

  const segment = await Segment.findById(campaign.segmentId);
  if (!segment) throw new apiError(404, "Segment not found");

  const customers = await Customer.find({ _id: { $in: segment.customerIds } });
  let sentCount = 0;

  for (const customer of customers) {
    // CHECK: Email Settings Compliance
    const settings = customer.emailSettings || {};

    // 1. Must be subscribed
    if (settings.subscribed === false) continue;

    // 2. Must allow marketing emails
    if (settings.marketingEmails === false) continue;

    const { subject, html } = generateCampaignEmail(
      customer.name,
      `We have a special offer for you in our ${campaign.name} campaign!`,
      campaign.couponId.code
    );

    try {
      await sendEmail(null, customer.email, subject, "Special Offer", html);
      sentCount++;

      // Update last email sent time
      customer.emailSettings.lastEmailSentAt = new Date();
      await customer.save({ validateBeforeSave: false });
    } catch (err) {
      console.error(`Failed to send campaign email to ${customer.email}`, err);
      // Continue to next customer even if one fails
    }
  }

  campaign.state = "sent";
  campaign.sentCount = sentCount;
  await campaign.save();

  res.status(200).json(new apiRes(200, campaign, "Campaign sent successfully"));
});
