import { Router } from "express";
import { authorize, protect } from "../../middleware/authMiddleware.js";
import {
  getStudent,
  getStudentClassOptions,
  getStudentClassSectionOptions,
  getStudentPromotionClasses,
  getStudentFeePortfolioHandler,
  getStudents,
  postPromoteClass,
  postPromoteStudent,
  postStudent,
  putStudent,
  removeStudent,
} from "./students.controller.js";

const router = Router();
const access = [protect, authorize("SUPER_ADMIN", "ACCOUNTANT")];
const adminOnly = [protect, authorize("SUPER_ADMIN")];

router.get("/", ...access, getStudents);
router.get("/class-options", ...access, getStudentClassOptions);
router.get("/class-section-options", ...access, getStudentClassSectionOptions);
router.get("/promotion-classes", ...access, getStudentPromotionClasses);
router.post("/promote-class", ...adminOnly, postPromoteClass);
router.get("/:id/fee-portfolio", ...access, getStudentFeePortfolioHandler);
router.post("/", ...adminOnly, postStudent);
router.get("/:id", ...access, getStudent);
router.put("/:id", ...adminOnly, putStudent);
router.delete("/:id", ...adminOnly, removeStudent);
router.post("/:id/promote", ...adminOnly, postPromoteStudent);

export default router;
