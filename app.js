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

app.set("trust proxy", 1);

await connectQdrant();

//middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://compliance-analysis-frontend-git-main-logic-lords.vercel.app",
      "https://compliance-analysis-frontend.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
app.use(express.json());
app.use(cookieParser());

//routes
app.get("/", (req, res) => {
  res.send("Compliance Analysis API is running");
});
app.use("/api/auth", authrouter);
app.use("/api/organization", organization);
app.use("/api/framework", framework);
app.use("/api/product", product);
app.use("/api/compliance", compliance);

export default app;
