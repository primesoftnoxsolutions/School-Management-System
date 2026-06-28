import mongoose from "mongoose";
import { env } from "./env.js";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

let memoryServer = null;
let localMongoProcess = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "../..");

const connectWithUri = async (uri) => {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const canConnectTcp = (host, port) =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout: 500 }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
  });

const getLocalMongoInfo = (uri) => {
  try {
    const parsed = new URL(uri);
    return {
      host: parsed.hostname || "127.0.0.1",
      port: Number(parsed.port || 27017),
    };
  } catch {
    return { host: "127.0.0.1", port: 27017 };
  }
};

const findMongodBinary = () => {
  const candidates = [
    process.env.MONGOD_PATH,
    "C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe",
    "C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe",
    "mongod",
  ].filter(Boolean);

  return candidates.find((candidate) => candidate === "mongod" || fs.existsSync(candidate));
};

const startLocalMongoProcess = async (uri) => {
  const { host, port } = getLocalMongoInfo(uri);
  const mongodPath = findMongodBinary();

  if (!mongodPath) {
    throw new Error("mongod.exe was not found. Install MongoDB locally or set MONGOD_PATH.");
  }

  const dbPath = path.join(backendRoot, ".data", "mongodb");
  fs.mkdirSync(dbPath, { recursive: true });

  localMongoProcess = spawn(
    mongodPath,
    ["--dbpath", dbPath, "--bind_ip", host, "--port", String(port), "--quiet"],
    {
      stdio: "ignore",
      windowsHide: true,
    }
  );

  localMongoProcess.on("exit", () => {
    localMongoProcess = null;
  });

  const cleanup = () => {
    if (localMongoProcess && !localMongoProcess.killed) {
      localMongoProcess.kill();
    }
  };
  const cleanupAndExit = () => {
    cleanup();
    process.exit(0);
  };

  process.once("exit", cleanup);
  process.once("SIGINT", cleanupAndExit);
  process.once("SIGTERM", cleanupAndExit);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (await canConnectTcp(host, port)) return;
    await sleep(500);
  }

  cleanup();
  throw new Error(`Started mongod but ${host}:${port} did not become ready.`);
};

export const connectDB = async () => {
  if (!env.mongodbUri) {
    throw new Error("Missing MONGODB_URI or MONGO_URI in environment");
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
        `MongoDB connection failed: ${error.message}. Start MongoDB service or update MONGODB_URI / MONGO_URI.`
      );
    }

    console.warn("Local MongoDB is not running. Trying development fallbacks...");

    try {
      console.warn("Trying installed local mongod.exe with backend/.data/mongodb...");
      await startLocalMongoProcess(env.mongodbUri);
      await connectWithUri(env.mongodbUri);
      console.log("MongoDB connected (local dev mongod process)");
      return;
    } catch (localStartError) {
      console.warn(`Could not start local mongod.exe: ${localStartError.message}`);
    }

    try {
      console.warn("Falling back to in-memory MongoDB for development...");
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri("school_erp");

      await connectWithUri(memoryUri);
      console.log("MongoDB connected (in-memory dev database)");
      console.log("Tip: Install/start MongoDB locally for persistent data: npm run mongo:start");
    } catch (memoryError) {
      throw new Error(
        [
          `MongoDB connection failed: ${error.message}`,
          `Local mongod fallback failed and mongodb-memory-server also failed: ${memoryError.message}`,
          "Fix: run backend terminal as Administrator and execute `npm run mongo:start`,",
          "or start MongoDB from Windows Services, then run `npm run dev` again.",
        ].join(" ")
      );
    }
  }
};
