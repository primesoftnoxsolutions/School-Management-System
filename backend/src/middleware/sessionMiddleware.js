import session from "express-session";
import { env } from "../config/env.js";

export const sessionMiddleware = session({
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: env.nodeEnv === "production" ? "strict" : "lax",
  },
});
