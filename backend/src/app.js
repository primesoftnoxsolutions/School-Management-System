import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import admissionsRoutes from "./modules/admissions/admissions.routes.js";
import teachersRoutes from "./modules/teachers/teachers.routes.js";
import teacherPanelRoutes from "./modules/teacher-panel/teacherPanel.routes.js";
import studentsRoutes from "./modules/students/students.routes.js";
import feesRoutes from "./modules/fees/fees.routes.js";
import feeRefundsRoutes from "./modules/fee-refunds/feeRefunds.routes.js";
import finesRoutes from "./modules/fines/fines.routes.js";
import payrollRoutes from "./modules/payroll/payroll.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import teacherAttendanceRoutes from "./modules/teacher-attendance/teacherAttendance.routes.js";
import schoolLeavingRoutes from "./modules/school-leaving/schoolLeaving.routes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { sessionMiddleware } from "./middleware/sessionMiddleware.js";
import { env } from "./config/env.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.nodeEnv === "production" ? process.env.FRONTEND_URL : "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ success: true, message: "School ERP API healthy" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/admissions", admissionsRoutes);
app.use("/api/v1/teachers", teachersRoutes);
app.use("/api/v1/teacher-panel", teacherPanelRoutes);
app.use("/api/v1/students", studentsRoutes);
app.use("/api/v1/fees", feesRoutes);
app.use("/api/v1/fee-refunds", feeRefundsRoutes);
app.use("/api/v1/fines", finesRoutes);
app.use("/api/v1/payroll", payrollRoutes);
app.use("/api/v1/reports", reportsRoutes);
app.use("/api/v1/teacher-attendance", teacherAttendanceRoutes);
app.use("/api/v1/school-leaving", schoolLeavingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
