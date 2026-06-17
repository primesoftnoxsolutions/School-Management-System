import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import admissionsRoutes from "./modules/admissions/admissions.routes.js";
import teachersRoutes from "./modules/teachers/teachers.routes.js";
import teacherPanelRoutes from "./modules/teacher-panel/teacherPanel.routes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ success: true, message: "School ERP API healthy" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/admissions", admissionsRoutes);
app.use("/api/v1/teachers", teachersRoutes);
app.use("/api/v1/teacher-panel", teacherPanelRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
