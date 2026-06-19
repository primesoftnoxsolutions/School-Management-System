import { User } from "../models/User.js";
import { env } from "../config/env.js";

const DEV_ADMIN_EMAIL = "admin@schoolerp.local";
const DEV_ADMIN_PASSWORD = "Admin@123";
const REMOVED_DEFAULT_EMAILS = [
  "accountant@schoolerp.local",
  "teacher@schoolerp.local",
];

const resolveSeedCredentials = () => {
  const isProd = env.nodeEnv === "production";
  const email = (env.seedAdminEmail || (!isProd ? DEV_ADMIN_EMAIL : "")).toLowerCase().trim();
  const password = env.seedAdminPassword || (!isProd ? DEV_ADMIN_PASSWORD : "");
  const fullName = env.seedAdminName || "Super Admin";
  return { email, password, fullName, isProd };
};

export const seedSuperAdmin = async () => {
  await User.updateMany(
    { email: { $in: REMOVED_DEFAULT_EMAILS }, isDeleted: false },
    { $set: { isDeleted: true, updatedBy: "system" } }
  );

  const { email, password, fullName, isProd } = resolveSeedCredentials();

  if (!email || !password) {
    console.warn(
      "Super admin seed skipped. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env (required on live/production)."
    );
    return;
  }

  let user = await User.findOne({ email, isDeleted: false }).select("+password");

  if (user) {
    if (user.role !== "SUPER_ADMIN") {
      user.role = "SUPER_ADMIN";
      user.updatedBy = "system";
      await user.save();
    }

    if (!isProd) {
      const passwordOk = await user.comparePassword(password);
      if (!passwordOk) {
        user.password = password;
        user.updatedBy = "system";
        await user.save();
        console.log(`Dev: synced super admin password for ${email}`);
      }
    }

    if (!isProd && email === DEV_ADMIN_EMAIL) {
      console.log(`Dev super admin ready: ${email} / ${DEV_ADMIN_PASSWORD}`);
    }
    return;
  }

  const adminCount = await User.countDocuments({ role: "SUPER_ADMIN", isDeleted: false });
  if (adminCount > 0 && isProd) {
    console.log("Super admin already exists in production — seed skipped.");
    return;
  }

  await User.create({
    fullName,
    email,
    password,
    role: "SUPER_ADMIN",
    createdBy: "system",
    updatedBy: "system",
  });

  console.log(`Seeded super admin: ${email}`);
  if (!isProd && email === DEV_ADMIN_EMAIL) {
    console.log(`Login with: ${DEV_ADMIN_EMAIL} / ${DEV_ADMIN_PASSWORD}`);
  }
};
