import { Router } from "express";
import { authorize, protect } from "../../middleware/authMiddleware.js";
import { createAdmission, listAdmissions } from "./admissions.controller.js";

const router = Router();

router.get("/", protect, authorize("SUPER_ADMIN", "TEACHER"), listAdmissions);
router.post("/", protect, authorize("SUPER_ADMIN"), createAdmission);

export default router;
