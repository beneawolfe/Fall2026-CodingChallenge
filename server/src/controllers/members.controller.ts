import { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../errors";
import {
  getUserId,
  parseId,
  requireCollectionAccess,
} from "../services/access";
import { notifyUser } from "../services/notifications";
import { requiredString } from "../validation";

// Roles that can be handed out (the owner role belongs to the creator only)
function parseRole(value: unknown): "editor" | "viewer" {
  if (value === undefined) return "editor";
  if (value === "editor" || value === "viewer") return value;
  throw new HttpError(400, "role must be 'editor' or 'viewer'");
}

// GET /api/collections/:id/members (owner or editor)
export async function listMembers(req: Request, res: Response) {
  const collectionId = parseId(req.params.id, "collection id");
  const { collection } = await requireCollectionAccess(
    collectionId,
    getUserId(req),
    "editor"
  );

  const owner = await pool.query(
    "SELECT id, username FROM users WHERE id = $1",
    [collection.owner_id]
  );
  const members = await pool.query(
    `SELECT u.id, u.username, m.role
     FROM collection_members m
     JOIN users u ON u.id = m.user_id
     WHERE m.collection_id = $1
     ORDER BY u.username`,
    [collectionId]
  );
  res.json({ owner: owner.rows[0], members: members.rows });
}

// POST /api/collections/:id/members (owner only)
// Body: { "user": "<email or username>", "role": "editor" | "viewer" }
export async function addMember(req: Request, res: Response) {
  const collectionId = parseId(req.params.id, "collection id");
  const actorId = getUserId(req);
  const { collection } = await requireCollectionAccess(
    collectionId,
    actorId,
    "owner"
  );

  const identifier = requiredString(req.body?.user, "user", 254);
  const role = parseRole(req.body?.role);

  // Emails contain "@" and usernames cannot, so a match is never ambiguous
  const found = await pool.query(
    "SELECT id, username FROM users WHERE email = LOWER($1) OR username = $1",
    [identifier]
  );
  const target = found.rows[0];
  if (!target) {
    throw new HttpError(404, "No user found with that email or username");
  }
  if (target.id === collection.owner_id) {
    throw new HttpError(400, "The owner already has full access");
  }

  try {
    await pool.query(
      `INSERT INTO collection_members (collection_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [collectionId, target.id, role]
    );
  } catch (err) {
    // 23505 = unique violation: already a collaborator
    if ((err as { code?: string }).code === "23505") {
      throw new HttpError(409, "That user is already a collaborator");
    }
    throw err;
  }

  await notifyUser(
    target.id,
    collectionId,
    actorId,
    `shared "${collection.name}" with you as ${role}`
  );
  res
    .status(201)
    .json({ member: { id: target.id, username: target.username, role } });
}

// PATCH /api/collections/:id/members/:userId (owner only)
// Body: { "role": "editor" | "viewer" }
export async function updateMember(req: Request, res: Response) {
  const collectionId = parseId(req.params.id, "collection id");
  const targetId = parseId(req.params.userId, "user id");
  const actorId = getUserId(req);
  const { collection } = await requireCollectionAccess(
    collectionId,
    actorId,
    "owner"
  );

  if (req.body?.role === undefined) {
    throw new HttpError(400, "role is required");
  }
  const role = parseRole(req.body.role);

  const result = await pool.query(
    `UPDATE collection_members SET role = $3
     WHERE collection_id = $1 AND user_id = $2
     RETURNING user_id`,
    [collectionId, targetId, role]
  );
  if (!result.rows[0]) {
    throw new HttpError(404, "Collaborator not found");
  }

  await notifyUser(
    targetId,
    collectionId,
    actorId,
    `changed your access to "${collection.name}" to ${role}`
  );
  res.json({ member: { id: targetId, role } });
}

// DELETE /api/collections/:id/members/:userId
// The owner can remove anyone; a collaborator can remove only themselves (leave).
export async function removeMember(req: Request, res: Response) {
  const collectionId = parseId(req.params.id, "collection id");
  const targetId = parseId(req.params.userId, "user id");
  const actorId = getUserId(req);
  const { collection, role } = await requireCollectionAccess(
    collectionId,
    actorId,
    "viewer"
  );

  const leavingSelf = targetId === actorId;
  if (!leavingSelf && role !== "owner") {
    throw new HttpError(403, "Only the owner can remove collaborators");
  }

  const result = await pool.query(
    `DELETE FROM collection_members
     WHERE collection_id = $1 AND user_id = $2
     RETURNING user_id`,
    [collectionId, targetId]
  );
  if (!result.rows[0]) {
    throw new HttpError(404, "Collaborator not found");
  }

  if (!leavingSelf) {
    await notifyUser(
      targetId,
      collectionId,
      actorId,
      `removed you from "${collection.name}"`
    );
  }
  res.status(204).send();
}