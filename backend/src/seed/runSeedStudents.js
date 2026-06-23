import { connectDB } from "../config/db.js";
import { seedStudents } from "./seedStudents.js";
import mongoose from "mongoose";

const run = async () => {
  await connectDB();
  await seedStudents();
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Failed to seed students:", err.message);
  process.exit(1);
});
