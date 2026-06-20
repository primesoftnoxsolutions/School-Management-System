import { User } from "../../models/User.js";
import { TeacherActivity } from "../../models/TeacherActivity.js";
import { ApiError } from "../../utils/apiError.js";

export const registerUser = async ({ fullName, email, password, role, actorId }) => {
  const exists = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
  if (exists) {
    throw new ApiError(409, "Email is already in use");
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    password,
    role,
    createdBy: actorId || null,
    updatedBy: actorId || null,
  });

  return {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail, isDeleted: false }).select("+password");

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid credentials");
  }

  const passwordOk = await user.comparePassword(password);
  if (!passwordOk) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.role === "TEACHER") {
    TeacherActivity.create({
      teacherId: user._id,
      action: "LOGIN",
      module: "AUTH",
      details: "Teacher logged in",
      status: "SUCCESS",
      createdBy: user._id.toString(),
      updatedBy: user._id.toString(),
    }).catch(() => {});
  }

  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

export const logoutUser = async (session) =>
  new Promise((resolve, reject) => {
    if (!session) {
      resolve();
      return;
    }
    session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
