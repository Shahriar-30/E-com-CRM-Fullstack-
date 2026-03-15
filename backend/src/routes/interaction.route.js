import express from "express";
import {
  createInteraction,
  deleteInteraction,
  getInteractions,
} from "../controller/interaction.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const interactionRouter = express.Router();

interactionRouter.use(authMiddleware);

interactionRouter.route("/").get(getInteractions).post(createInteraction);

interactionRouter.route("/:id").delete(deleteInteraction);
