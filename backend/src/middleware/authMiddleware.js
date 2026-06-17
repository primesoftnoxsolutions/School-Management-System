import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../services/tokenService.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization || "";
  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    throw new ApiError(401, "Unauthorized: missing bearer token");
  }

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.sub).select("_id fullName email role isActive");

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

  // Super Admin has full system authority across all modules/actions.
  if (req.user.role === "SUPER_ADMIN") {
    return next();
  }

  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, "Forbidden: insufficient permissions");
  }

  next();
};
