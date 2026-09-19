import { Request, Response } from "express";
import { pool } from "../db/pool";
import {
  getUserId,
  parseId,
  requireCollectionAccess,
} from "../services/access";
import {
  optionalBoolean,
  optionalString,
  requiredString,
} from "../validation";
import { toImage } from "./images.controller";

// Convert a database row to the JSON shape the frontend receives
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCollection(row: any, role: string) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isPublic: row.is_public,
    role,
    createdAt: row.created_at,
    // Only the owner can see the share token
    shareToken: role === "owner" ? row.share_token : undefined,
  };
}

// GET /api/collections: boards the user owns or collaborates on
export async function listCollections(req: Request, res: Response) {
  const userId = getUserId(req);
  const result = await pool.query(
    `SELECT c.*,
            CASE WHEN c.owner_id = $1 THEN 'owner' ELSE m.role END AS role,
            u.username AS owner_username,
            (SELECT COUNT(*) FROM images i WHERE i.collection_id = c.id)::int AS image_count,
            (SELECT i.preview_url FROM images i
              WHERE i.collection_id = c.id
              ORDER BY i.created_at DESC LIMIT 1) AS cover_url
     FROM collections c
     JOIN users u ON u.id = c.owner_id
     LEFT JOIN collection_members m
       ON m.collection_id = c.id AND m.user_id = $1
     WHERE c.owner_id = $1 OR m.user_id = $1
     ORDER BY c.created_at DESC`,
    [userId]
  );

  res.json({
    collections: result.rows.map((row) => ({
      ...toCollection(row, row.role),
      ownerUsername: row.owner_username,
      imageCount: row.image_count,
      coverUrl: row.cover_url,
    })),
  });
}

// POST /api/collections
export async function createCollection(req: Request, res: Response) {
  const body = req.body ?? {};
  const name = requiredString(body.name, "name", 100);
  const description = optionalString(body.description, "description", 500) ?? "";
  const isPublic = optionalBoolean(body.isPublic, "isPublic") ?? false;

  const result = await pool.query(
    `INSERT INTO collections (owner_id, name, description, is_public)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [getUserId(req), name, description, isPublic]
  );
  res.status(201).json({ collection: toCollection(result.rows[0], "owner") });
}

// GET /api/collections/:id: a board and its images (any role, or public)
export async function getCollection(req: Request, res: Response) {
  const collectionId = parseId(req.params.id, "collection id");
  const { collection, role } = await requireCollectionAccess(
    collectionId,
    getUserId(req),
    "viewer"
  );

  const images = await pool.query(
    "SELECT * FROM images WHERE collection_id = $1 ORDER BY created_at DESC",
    [collectionId]
  );
  res.json({
    collection: toCollection(collection, role),
    images: images.rows.map(toImage),
  });
}

// PATCH /api/collections/:id (owner only)
export async function updateCollection(req: Request, res: Response) {
  const collectionId = parseId(req.params.id, "collection id");
  await requireCollectionAccess(collectionId, getUserId(req), "owner");

  const body = req.body ?? {};
  const name =
    body.name === undefined ? undefined : requiredString(body.name, "name", 100);
  const description = optionalString(body.description, "description", 500);
  const isPublic = optionalBoolean(body.isPublic, "isPublic");

  // COALESCE keeps the existing value when a field is not provided
  const result = await pool.query(
    `UPDATE collections
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         is_public = COALESCE($4, is_public)
     WHERE id = $1
     RETURNING *`,
    [collectionId, name ?? null, description ?? null, isPublic ?? null]
  );
  res.json({ collection: toCollection(result.rows[0], "owner") });
}

// DELETE /api/collections/:id (owner only; images are removed by ON DELETE CASCADE)
export async function deleteCollection(req: Request, res: Response) {
  const collectionId = parseId(req.params.id, "collection id");
  await requireCollectionAccess(collectionId, getUserId(req), "owner");

  await pool.query("DELETE FROM collections WHERE id = $1", [collectionId]);
  res.status(204).send();
}