import { HttpError } from "./errors";

// Trimmed, non-empty string within a max length
export function requiredString(
  value: unknown,
  field: string,
  max: number
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.length > max
  ) {
    throw new HttpError(400, `${field} is required (max ${max} characters)`);
  }
  return value.trim();
}

// Undefined passes through; anything else must be a string within max length
export function optionalString(
  value: unknown,
  field: string,
  max: number
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length > max) {
    throw new HttpError(400, `${field} must be a string (max ${max} characters)`);
  }
  return value.trim();
}

// Undefined passes through; anything else must be true or false
export function optionalBoolean(
  value: unknown,
  field: string
): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") {
    throw new HttpError(400, `${field} must be true or false`);
  }
  return value;
}

// Only accept http(s) URLs so we never store javascript: or data: links
export function httpUrl(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length > 2000) {
    throw new HttpError(400, `${field} must be a valid http(s) URL`);
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("bad protocol");
    }
  } catch {
    throw new HttpError(400, `${field} must be a valid http(s) URL`);
  }
  return value;
}