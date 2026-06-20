import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const userId = req.session?.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: no active session");
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
