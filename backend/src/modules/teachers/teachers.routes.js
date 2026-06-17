import { Router } from "express";
import { authorize, protect } from "../../middleware/authMiddleware.js";
import {
  createTeacherAccount,
  getTeacherOwnPanel,
  getTeachers,
  monitorTeacherActivities,
} from "./teachers.controller.js";

const router = Router();

router.post("/", protect, authorize("SUPER_ADMIN"), createTeacherAccount);
router.get("/", protect, authorize("SUPER_ADMIN", "ACCOUNTANT"), getTeachers);
router.get("/activities", protect, authorize("SUPER_ADMIN", "ACCOUNTANT"), monitorTeacherActivities);
router.get("/my-panel", protect, authorize("TEACHER"), getTeacherOwnPanel);

export default router;
