import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authrouter from "./api/routes/auth.routes.js";
import cookieParser from "cookie-parser";
import organization from "./api/routes/organization.routes.js";

dotenv.config();

connectDB();

const app = express();

//middleware
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/auth", authrouter);
app.use("/api/organization", organization);

export default app;
