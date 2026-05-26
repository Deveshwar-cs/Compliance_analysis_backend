import express from "express";
import {
  getuser,
  signin,
  signout,
  signUp,
} from "../controller/auth.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signin);
router.post("/get-users", protect, getuser);
router.post("/signout", signout);

export default router;
