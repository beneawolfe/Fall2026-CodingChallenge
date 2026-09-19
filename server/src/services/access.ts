import { Request } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../errors";

export type Role = "owner" | "editor" | "viewer";

const RANK: Record<Role, number> = { viewer: 1, editor: 2, owner: 3 };

// Parse a numeric id from a URL parameter or fail with 400
export function parseId(value: unknown, label = "id"): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `Invalid ${label}`);
  }
  return id;
}

// The logged-in user's id, set earlier by the requireAuth middleware
export function getUserId(req: Request): number {
  if (req.userId === undefined) {
    throw new HttpError(401, "Not authenticated");
  }
  return req.userId;
}

// Loads a collection and checks the user has at least the given role.
// Returns 404 (not 403) when the user cannot see it, so ids don't leak.
export async function requireCollectionAccess(
  collectionId: number,
  userId: number,
  minRole: Role
) {
  const result = await pool.query(
    `SELECT c.*,
            CASE WHEN c.owner_id = $2 THEN 'owner' ELSE m.role END AS role
     FROM collections c
     LEFT JOIN collection_members m
       ON m.collection_id = c.id AND m.user_id = $2
     WHERE c.id = $1`,
    [collectionId, userId]
  );
  const row = result.rows[0];
  if (!row) {
    throw new HttpError(404, "Collection not found");
  }

  // Owners and members use their role; anyone else can only view public boards
  const role: Role | null = row.role ?? (row.is_public ? "viewer" : null);
  if (!role) {
    throw new HttpError(404, "Collection not found");
  }
  if (RANK[role] < RANK[minRole]) {
    throw new HttpError(403, "You do not have permission to do that");
  }
  return { collection: row, role };
}