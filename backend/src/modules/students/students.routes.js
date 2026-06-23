import { Router } from "express";
import { authorize, protect } from "../../middleware/authMiddleware.js";
import {
  getStudent,
  getStudentAttendanceCalendarHandler,
  getStudentAttendanceTotalsHandler,
  getStudentClassOptions,
  getStudentClassSectionOptions,
  getStudentPromotionClasses,
  getNextStudentRoll,
  getStudentFeePortfolioHandler,
  getStudents,
  postPromoteClass,
  postPromoteStudent,
  postStudent,
  putStudent,
  removeStudent,
  uploadStudentPhotoHandler,
} from "./students.controller.js";
import { studentPhotoUpload } from "../../middleware/uploadStudentPhoto.js";

const router = Router();
const access = [protect, authorize("SUPER_ADMIN", "ACCOUNTANT")];
const adminOnly = [protect, authorize("SUPER_ADMIN")];

router.get("/", ...access, getStudents);
router.get("/class-options", ...access, getStudentClassOptions);
router.get("/class-section-options", ...access, getStudentClassSectionOptions);
router.get("/promotion-classes", ...access, getStudentPromotionClasses);
router.get("/attendance-totals", ...access, getStudentAttendanceTotalsHandler);
router.get("/attendance-calendar", ...access, getStudentAttendanceCalendarHandler);
router.get("/next-roll", ...adminOnly, getNextStudentRoll);
router.post("/promote-class", ...adminOnly, postPromoteClass);
router.post("/upload-photo", ...adminOnly, studentPhotoUpload.single("photo"), uploadStudentPhotoHandler);
router.get("/:id/fee-portfolio", ...access, getStudentFeePortfolioHandler);
router.post("/", ...adminOnly, postStudent);
router.get("/:id", ...access, getStudent);
router.put("/:id", ...adminOnly, putStudent);
router.delete("/:id", ...adminOnly, removeStudent);
router.post("/:id/promote", ...adminOnly, postPromoteStudent);

export default router;
