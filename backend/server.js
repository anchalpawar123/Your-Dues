import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import hodRoutes from "./routes/hodRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
 

dotenv.config();

const app = express();

// middlewares
app.use(cors());
// app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/department", departmentRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/admin", adminRoutes); 

// db connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
