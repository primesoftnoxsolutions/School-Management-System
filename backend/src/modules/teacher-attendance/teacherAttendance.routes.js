import { Router } from "express";
import { authorize, protect } from "../../middleware/authMiddleware.js";
import { getAttendance, getCalendar, getStats, postMark, postResetDemo } from "./teacherAttendance.controller.js";

const router = Router();
const access = [protect, authorize("SUPER_ADMIN", "ACCOUNTANT")];

router.get("/calendar", ...access, getCalendar);
router.get("/", ...access, getAttendance);
router.get("/stats", ...access, getStats);
router.post("/mark", ...access, postMark);
router.post("/reset-demo", ...access, postResetDemo);

export default router;
