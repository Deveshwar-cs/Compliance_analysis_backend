import express from "express";
import {signin, signUp} from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signin);

export default router;
