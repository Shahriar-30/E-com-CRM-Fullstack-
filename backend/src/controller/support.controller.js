import mongoose from "mongoose";
import { Support } from "../models/support.model.js";
import { Customer } from "../models/customer.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSupportTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority } = req.query;

  // 1. Find customers owned by the logged-in user
  const myCustomers = await Customer.find({ createdBy: req.user._id }).select(
    "_id"
  );
  const myCustomerIds = myCustomers.map((c) => c._id);

  const query = { customerId: { $in: myCustomerIds } };

  if (status) query.status = status;
  if (priority) query.priority = priority;

  const tickets = await Support.find(query)
    .populate("customerId", "name email")
    .populate("orderId", "total status")
    .sort({ updatedAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  const total = await Support.countDocuments(query);

  res
    .status(200)
    .json(
      new apiRes(
        200,
        { tickets, total },
        "Support tickets fetched successfully"
      )
    );
});

export const getSupportTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid ticket ID");
  }

  const ticket = await Support.findById(id)
    .populate("customerId", "name email phone createdBy")
    .populate("orderId");

  if (!ticket) {
    throw new apiError(404, "Ticket not found");
  }

  // Ownership check
  if (ticket.customerId.createdBy.toString() !== req.user._id.toString()) {
    throw new apiError(403, "You do not have permission to view this ticket");
  }

  res
    .status(200)
    .json(new apiRes(200, ticket, "Support ticket fetched successfully"));
});

export const updateSupportTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject, priority, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid ticket ID");
  }

  const ticketCheck = await Support.findById(id).populate("customerId");
  if (
    !ticketCheck ||
    ticketCheck.customerId.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new apiError(404, "Ticket not found or access denied");
  }

  const ticket = await Support.findByIdAndUpdate(
    id,
    { subject, priority, status, resolved: status === "resolved" },
    { new: true }
  )
    .populate("customerId", "name email phone createdBy")
    .populate("orderId");

  res.status(200).json(new apiRes(200, ticket, "Ticket updated successfully"));
});

export const createSupportTicket = asyncHandler(async (req, res) => {
  const { customerId, orderId, subject, priority, message } = req.body;

  if (!customerId || !orderId || !subject || !priority || !message) {
    throw new apiError(400, "All fields are required");
  }

  // Verify the customer belongs to the logged-in user
  const customer = await Customer.findOne({
    _id: customerId,
    createdBy: req.user._id,
  });
  if (!customer) {
    throw new apiError(404, "Customer not found or access denied");
  }

  const ticket = await Support.create({
    customerId,
    orderId,
    subject,
    priority,
    messages: [{ sender: "customer", message }],
  });

  res
    .status(201)
    .json(new apiRes(201, ticket, "Support ticket created successfully"));
});

export const replySupportTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    throw new apiError(400, "Message is required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new apiError(400, "Invalid ticket ID");
  }

  const ticketCheck = await Support.findById(id).populate("customerId");
  if (
    !ticketCheck ||
    ticketCheck.customerId.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new apiError(404, "Ticket not found or access denied");
  }

  const ticket = await Support.findByIdAndUpdate(
    id,
    {
      $push: { messages: { sender: "agent", message } },
      $set: { status: "in-progress" },
    },
    { new: true }
  )
    .populate("customerId", "name email phone createdBy")
    .populate("orderId");

  res.status(200).json(new apiRes(200, ticket, "Reply added successfully"));
});

export const updateSupportStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["open", "in-progress", "resolved"].includes(status)) {
    throw new apiError(400, "Invalid status");
  }

  const ticketCheck = await Support.findById(id).populate("customerId");
  if (
    !ticketCheck ||
    ticketCheck.customerId.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new apiError(404, "Ticket not found or access denied");
  }

  const ticket = await Support.findByIdAndUpdate(
    id,
    { status, resolved: status === "resolved" },
    { new: true }
  )
    .populate("customerId", "name email phone createdBy")
    .populate("orderId");

  res.status(200).json(new apiRes(200, ticket, "Status updated successfully"));
});
