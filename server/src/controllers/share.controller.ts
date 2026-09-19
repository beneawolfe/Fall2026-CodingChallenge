import { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../errors";
import {
  getUserId,
  parseId,
  requireCollectionAccess,
} from "../services/access";
import { toImage } from "./images.controller";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/share/:token (public and read-only; no login needed)
export async function getSharedCollection(req: Request, res: Response) {
  const token = String(req.params.token);
  // Reject malformed tokens before they reach the uuid column
  if (!UUID_PATTERN.test(token)) {
    throw new HttpError(404, "Shared collection not found");
  }

  const result = await pool.query(
    `SELECT c.id, c.name, c.description, c.created_at,
            u.username AS owner_username
     FROM collections c
     JOIN users u ON u.id = c.owner_id
     WHERE c.share_token = $1`,
    [token]
  );
  const row = result.rows[0];
  if (!row) {
    throw new HttpError(404, "Shared collection not found");
  }

  const images = await pool.query(
    "SELECT * FROM images WHERE collection_id = $1 ORDER BY created_at DESC",
    [row.id]
  );
  res.json({
    collection: {
      id: row.id,
      name: row.name,
      description: row.description,
      ownerUsername: row.owner_username,
      createdAt: row.created_at,
    },
    // Hide who added each image on the public view
    images: images.rows.map((imageRow) => {
      const { addedBy: _addedBy, ...image } = toImage(imageRow);
      return image;
    }),
  });
}

// POST /api/collections/:id/share-token (owner only)
// Issues a new link and invalidates the old one
export async function regenerateShareToken(req: Request, res: Response) {
  const collectionId = parseId(req.params.id, "collection id");
  await requireCollectionAccess(collectionId, getUserId(req), "owner");

  const result = await pool.query(
    `UPDATE collections SET share_token = gen_random_uuid()
     WHERE id = $1
     RETURNING share_token`,
    [collectionId]
  );
  res.json({ shareToken: result.rows[0].share_token });
}