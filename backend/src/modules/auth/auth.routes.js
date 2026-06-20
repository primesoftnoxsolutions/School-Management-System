import { Router } from "express";
import { login, logout, me, register } from "./auth.controller.js";
import { authorize, protect } from "../../middleware/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, me);
router.post("/register", protect, authorize("SUPER_ADMIN"), register);

export default router;
