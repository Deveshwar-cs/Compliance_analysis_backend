import express from "express";
import protect, {isAdmin} from "../middlewares/auth.middleware.js";
import {
  createFrameWork,
  getFramework,
  syncFrameworksToVectorDB,
} from "../controller/framework.controller.js";

const router = express.Router();

router.post("/create", protect, isAdmin, createFrameWork);
router.get("/get-frameworks", getFramework);
router.post("/sync-vector-db", protect, isAdmin, syncFrameworksToVectorDB);

export default router;
