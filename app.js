import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authrouter from "./api/routes/auth.routes.js";
import cookieParser from "cookie-parser";
import organization from "./api/routes/organization.routes.js";
import framework from "./api/routes/framework.routes.js";
import product from "./api/routes/product.routes.js";
import compliance from "./api/routes/compliance.routes.js";
import cors from "cors";
import {connectQdrant} from "./config/qdrant.js";

dotenv.config();

connectDB();

const app = express();

await connectQdrant();

//middleware
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/api/auth", authrouter);
app.use("/api/organization", organization);
app.use("/api/framework", framework);
app.use("/api/product", product);
app.use("/api/compliance", compliance);

export default app;
