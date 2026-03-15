import express from "express";

export let campaignRouter = express.Router();

campaignRouter.route("/createcampaign").post(createCampaign);
