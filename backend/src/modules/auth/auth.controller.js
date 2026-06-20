import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { loginUser, logoutUser, registerUser } from "./auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;
  if (!fullName || !email || !password || !role) {
    throw new ApiError(400, "fullName, email, password, role are required");
  }

  const user = await registerUser({
    fullName,
    email,
    password,
    role,
    actorId: req.user?._id?.toString() || null,
  });

  res.status(201).json({ success: true, data: user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const result = await loginUser({ email, password });
  req.session.userId = result.user.id.toString();
  req.session.role = result.user.role;

  res.status(200).json({ success: true, data: result });
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.session);
  res.clearCookie("connect.sid");
  res.status(200).json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});
