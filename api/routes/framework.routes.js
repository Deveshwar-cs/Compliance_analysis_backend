import express from "express";
import protect, {isAdmin} from "../middlewares/auth.middleware.js";
import {
  createFrameWork,
  getFramework,
} from "../controller/framework.controller.js";

const router = express.Router();

router.post("/create", protect, isAdmin, createFrameWork);
router.get("/get", getFramework);

export default router;
