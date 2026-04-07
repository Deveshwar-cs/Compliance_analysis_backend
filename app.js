import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authrouter from "./api/routes/auth.routes.js";

dotenv.config();

connectDB();

const app = express();

//middleware
app.use(express.json());

//routes
app.use("/api/auth", authrouter);

export default app;
