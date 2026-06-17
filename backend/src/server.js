import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { seedSuperAdmin } from "./seed/seedSuperAdmin.js";

const start = async () => {
  let dbConnected = false;
  try {
    await connectDB();
    dbConnected = true;
  } catch (error) {
    if (env.nodeEnv === "production") {
      throw error;
    }
    console.warn("MongoDB unavailable. Running in demo mode without database.");
  }

  if (dbConnected) {
    await seedSuperAdmin();
  }

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
