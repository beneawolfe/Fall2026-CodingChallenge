import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool";
import { config } from "../config";
import { HttpError } from "../errors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;

// Create a signed login token that stores only the user's id
function signToken(userId: number): string {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  const { email, username, password } = req.body ?? {};

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, "A valid email is required");
  }
  if (typeof username !== "string" || !USERNAME_PATTERN.test(username)) {
    throw new HttpError(
      400,
      "Username must be 3-30 characters: letters, numbers, underscores"
    );
  }
  if (typeof password !== "string" || password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters");
  }

  // Never store the raw password, only the bcrypt hash
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username`,
      [email.toLowerCase(), username, passwordHash]
    );
    const user = result.rows[0];
    res.status(201).json({ token: signToken(user.id), user });
  } catch (err) {
    // 23505 = Postgres unique violation (email or username already taken)
    if ((err as { code?: string }).code === "23505") {
      throw new HttpError(409, "Email or username already in use");
    }
    throw err;
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string") {
    throw new HttpError(400, "Email and password are required");
  }

  const result = await pool.query(
    "SELECT id, email, username, password_hash FROM users WHERE email = $1",
    [email.toLowerCase()]
  );
  const row = result.rows[0];

  // Same error for unknown email and wrong password so attackers learn nothing
  const valid = row && (await bcrypt.compare(password, row.password_hash));
  if (!valid) {
    throw new HttpError(401, "Invalid email or password");
  }

  res.json({
    token: signToken(row.id),
    user: { id: row.id, email: row.email, username: row.username },
  });
}

// GET /api/auth/me (requires a valid token)
export async function me(req: Request, res: Response) {
  const result = await pool.query(
    "SELECT id, email, username FROM users WHERE id = $1",
    [req.userId]
  );
  if (!result.rows[0]) {
    throw new HttpError(404, "User not found");
  }
  res.json({ user: result.rows[0] });
}