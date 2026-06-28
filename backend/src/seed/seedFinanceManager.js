import { User } from "../models/User.js";
import { env } from "../config/env.js";

const DEV_FINANCE_EMAIL = "finance@schoolerp.local";
const DEV_FINANCE_PASSWORD = "Finance@123";

const resolveSeedCredentials = () => {
  const isProd = env.nodeEnv === "production";
  const email = (env.seedFinanceEmail || (!isProd ? DEV_FINANCE_EMAIL : "")).toLowerCase().trim();
  const password = env.seedFinancePassword || (!isProd ? DEV_FINANCE_PASSWORD : "");
  const fullName = env.seedFinanceName || "Finance Manager";
  return { email, password, fullName, isProd };
};

export const seedFinanceManager = async () => {
  const { email, password, fullName, isProd } = resolveSeedCredentials();

  if (!email || !password) {
    if (!isProd) {
      console.warn(
        "Finance manager seed skipped. Set SEED_FINANCE_EMAIL and SEED_FINANCE_PASSWORD in .env, or use the built-in dev defaults."
      );
    }
    return;
  }

  let user = await User.findOne({ email, isDeleted: false }).select("+password");

  if (user) {
    if (user.role !== "ACCOUNTANT") {
      user.role = "ACCOUNTANT";
      user.updatedBy = "system";
      await user.save();
    }

    if (!isProd) {
      const passwordOk = await user.comparePassword(password);
      if (!passwordOk) {
        user.password = password;
        user.updatedBy = "system";
        await user.save();
        console.log(`Dev: synced finance manager password for ${email}`);
      }
    }

    if (!isProd && email === DEV_FINANCE_EMAIL) {
      console.log(`Dev finance manager ready: ${email} / ${DEV_FINANCE_PASSWORD}`);
    }
    return;
  }

  const accountantCount = await User.countDocuments({ role: "ACCOUNTANT", isDeleted: false });
  if (accountantCount > 0 && isProd) {
    console.log("Finance manager already exists in production — seed skipped.");
    return;
  }

  await User.create({
    fullName,
    email,
    password,
    role: "ACCOUNTANT",
    createdBy: "system",
    updatedBy: "system",
  });

  console.log(`Seeded finance manager: ${email}`);
  if (!isProd && email === DEV_FINANCE_EMAIL) {
    console.log(`Login with: ${DEV_FINANCE_EMAIL} / ${DEV_FINANCE_PASSWORD}`);
  }
};
