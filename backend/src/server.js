import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { seedSuperAdmin } from "./seed/seedSuperAdmin.js";
import { seedFinanceManager } from "./seed/seedFinanceManager.js";

const start = async () => {
  await connectDB();
  await seedSuperAdmin();
  await seedFinanceManager();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
