import express from "express";

import {
  analyzeCompliance,
  getReports,
  getSingleReport,
} from "../controller/complaince.controller.js";

import {protect} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Analyze
router.post("/analyze", protect, analyzeCompliance);

// Get All Reports
router.get("/get-reports", protect, getReports);

// Get Single Report
router.get("/report/:id", protect, getSingleReport);

export default router;
