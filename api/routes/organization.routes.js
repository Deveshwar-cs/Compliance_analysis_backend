import express from "express";
import {
  createOrganization,
  getAllCompanies,
} from "../controller/organization.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/create", protect, createOrganization);
router.post("/get-companies", getAllCompanies);

export default router;
