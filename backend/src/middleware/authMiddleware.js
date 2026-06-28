import { User } from "../models/User.js";
import { Student } from "../models/Student.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const userId = req.session?.userId;
  const role = req.session?.role;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: no active session");
  }

  if (role === "STUDENT") {
    const student = await Student.findOne({ _id: userId, isDeleted: false, status: "ACTIVE" }).select(
      "_id firstName lastName admissionNo className section loginId status"
    );

    if (!student) {
      throw new ApiError(401, "Unauthorized: invalid user");
    }

    req.user = {
      _id: student._id,
      id: student._id,
      fullName: `${student.firstName || ""} ${student.lastName || ""}`.trim() || student.admissionNo || "Student",
      email: student.loginId || student.admissionNo || "",
      role: "STUDENT",
      admissionNo: student.admissionNo,
      className: student.className,
      section: student.section || "A",
    };
    next();
    return;
  }

  const user = await User.findById(userId).select("_id fullName email role isActive");

  if (!user || !user.isActive) {
    throw new ApiError(401, "Unauthorized: invalid user");
  }

  req.user = user;
  next();
});

export const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  if (req.user.role === "SUPER_ADMIN") {
    return next();
  }

  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, "Forbidden: insufficient permissions");
  }

  next();
};
