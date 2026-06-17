import { User } from "../../models/User.js";
import { ApiError } from "../../utils/apiError.js";
import { signAccessToken, signRefreshToken } from "../../services/tokenService.js";
import { env } from "../../config/env.js";

const demoUsers = [
  {
    id: "demo-super-admin",
    fullName: "Naseer Ideal Super Admin",
    email: "admin@schoolerp.local",
    role: "SUPER_ADMIN",
    password: "Admin@123",
  },
  {
    id: "demo-teacher",
    fullName: "Naseer Ideal Teacher",
    email: "teacher@schoolerp.local",
    role: "TEACHER",
    password: "Teacher@123",
  },
  {
    id: "demo-accountant",
    fullName: "Naseer Ideal Accountant",
    email: "accountant@schoolerp.local",
    role: "ACCOUNTANT",
    password: "Account@123",
  },
];

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
  let user;

  try {
    user = await User.findOne({ email: normalizedEmail, isDeleted: false }).select("+password");

    if (!user || !user.isActive) {
      throw new ApiError(401, "Invalid credentials");
    }

    const passwordOk = await user.comparePassword(password);
    if (!passwordOk) {
      throw new ApiError(401, "Invalid credentials");
    }

    const payload = { sub: user._id.toString(), role: user.role };

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    const canUseDemo = env.nodeEnv !== "production";
    if (!canUseDemo) throw error;

    const demoUser = demoUsers.find(
      (item) => item.email === normalizedEmail && item.password === password
    );

    if (!demoUser) {
      throw new ApiError(401, "Invalid credentials");
    }

    const payload = {
      sub: demoUser.id,
      role: demoUser.role,
      demo: true,
      fullName: demoUser.fullName,
      email: demoUser.email,
    };

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: {
        id: demoUser.id,
        fullName: demoUser.fullName,
        email: demoUser.email,
        role: demoUser.role,
      },
    };
  }
};
