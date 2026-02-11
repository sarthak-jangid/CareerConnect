import dotenv from "dotenv";
dotenv.config({ path: path.resolve("../.env") });

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import postRoutes from "./routes/posts.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true // if you send cookies
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("uploads"));

// Routes
app.use(postRoutes);
app.use(userRoutes);

const start = async () => {
  const connectDB = await mongoose.connect(process.env.MONGO_URI);
  app.listen(9090, () => {
    console.log("Server is running on port 9090");
  });
};
start();
