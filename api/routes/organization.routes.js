import express from "express";
import {createOrganization} from "../controller/organization.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();
router.post("/create", protect, createOrganization);

export default router;
