import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongodbUri: process.env.MONGO_URI || process.env.MONGODB_URI || "",
  sessionSecret: process.env.SESSION_SECRET || "dev-session-secret-change-in-production",
  seedAdminEmail: process.env.SEED_ADMIN_EMAIL || "",
  seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || "",
  seedAdminName: process.env.SEED_ADMIN_NAME || "Super Admin",
  seedFinanceEmail: process.env.SEED_FINANCE_EMAIL || "",
  seedFinancePassword: process.env.SEED_FINANCE_PASSWORD || "",
  seedFinanceName: process.env.SEED_FINANCE_NAME || "Finance Manager",
};
