import express from "express";
import {
  createSupportTicket,
  getSupportTicketById,
  getSupportTickets,
  replySupportTicket,
  updateSupportStatus,
} from "../controller/support.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const supportRouter = express.Router();

supportRouter.use(authMiddleware);

supportRouter.route("/").get(getSupportTickets).post(createSupportTicket);

supportRouter.route("/:id").get(getSupportTicketById);

supportRouter.route("/:id/reply").put(replySupportTicket);

supportRouter.route("/:id/status").put(updateSupportStatus);
