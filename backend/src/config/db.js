import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  if (!env.mongodbUri) {
    throw new Error("Missing MONGODB_URI in environment");
  }

  await mongoose.connect(env.mongodbUri);
  console.log("MongoDB connected");
};
