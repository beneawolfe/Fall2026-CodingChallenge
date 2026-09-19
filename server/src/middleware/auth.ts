import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { HttpError } from "../errors";

// Protects a route: requires "Authorization: Bearer <token>" and sets req.userId
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing or malformed Authorization header");
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as {
      userId: number;
    };
    req.userId = payload.userId;
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}