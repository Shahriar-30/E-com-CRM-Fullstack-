import express from "express";
import {
  createCampaign,
  deleteCampaign,
  getCampaigns,
  sendCampaign,
  updateCampaign,
} from "../controller/campaign.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export let campaignRouter = express.Router();

// global middleware
campaignRouter.use(authMiddleware);

campaignRouter.route("/").get(getCampaigns).post(createCampaign);

campaignRouter.route("/:id").put(updateCampaign).delete(deleteCampaign);

campaignRouter.route("/:id/send").post(sendCampaign);
