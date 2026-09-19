import { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors";

// Central error handler: known errors return their status, anything else is a 500
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}