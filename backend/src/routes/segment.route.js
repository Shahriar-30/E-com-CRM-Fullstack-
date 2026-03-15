import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import {
  getSegments,
  updateSegment,
  deleteSegment,
  runSegmentEngine,
  createSegment,
} from "../controller/segment.controller.js";
// import { createSegment } from "../controller/segmetn.controller.js";

export const segmentRouter = express.Router();

// global middleware
segmentRouter.use(authMiddleware);

// routes
segmentRouter.route("/createsegment").post(createSegment);

segmentRouter.route("/findsegments").get(getSegments);

segmentRouter
  .route("/segmentmodify/:id")
  .put(updateSegment)
  .delete(deleteSegment);

segmentRouter.route("/runsegmentengine").post(runSegmentEngine);
