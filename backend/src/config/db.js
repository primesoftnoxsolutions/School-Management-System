import mongoose from "mongoose";
import { env } from "./env.js";

let memoryServer = null;

const connectWithUri = async (uri) => {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
};

export const connectDB = async () => {
  if (!env.mongodbUri) {
    throw new Error("Missing MONGODB_URI in environment");
  }

  try {
    await connectWithUri(env.mongodbUri);
    console.log("MongoDB connected");
    return;
  } catch (error) {
    const isLocalMongo =
      env.mongodbUri.includes("127.0.0.1") || env.mongodbUri.includes("localhost");
    const canUseMemory = env.nodeEnv !== "production" && isLocalMongo;

    if (!canUseMemory) {
      throw new Error(
        `MongoDB connection failed: ${error.message}. Start MongoDB service or update MONGODB_URI.`
      );
    }

    console.warn("Local MongoDB is not running. Starting in-memory MongoDB for development...");

    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri("school_erp");

    await connectWithUri(memoryUri);
    console.log("MongoDB connected (in-memory dev database)");
    console.log("Tip: Install/start MongoDB locally for persistent data: npm run mongo:start");
  }
};
