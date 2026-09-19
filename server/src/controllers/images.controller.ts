import { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../errors";
import {
  getUserId,
  parseId,
  requireCollectionAccess,
} from "../services/access";
import { notifyCollectionMembers } from "../services/notifications";
import { httpUrl, optionalString } from "../validation";

// Convert a database row to the JSON shape the frontend receives
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toImage(row: any) {
  return {
    id: row.id,
    imageUrl: row.image_url,
    previewUrl: row.preview_url,
    tags: row.tags,
    note: row.note,
    addedBy: row.added_by,
    createdAt: row.created_at,
  };
}

// POST /api/collections/:id/images (owner or editor)
export async function addImage(req: Request, res: Response) {
  const collectionId = parseId(req.params.id, "collection id");
  const userId = getUserId(req);
  const { collection } = await requireCollectionAccess(
    collectionId,
    userId,
    "editor"
  );

  const body = req.body ?? {};
  const imageUrl = httpUrl(body.imageUrl, "imageUrl");
  const previewUrl = httpUrl(body.previewUrl, "previewUrl");
  const tags = optionalString(body.tags, "tags", 500) ?? "";
  const note = optionalString(body.note, "note", 1000) ?? "";

  try {
    const result = await pool.query(
      `INSERT INTO images (collection_id, added_by, image_url, preview_url, tags, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [collectionId, userId, imageUrl, previewUrl, tags, note]
    );
    await notifyCollectionMembers(
      collectionId,
      userId,
      `added an image to "${collection.name}"`
    );
    res.status(201).json({ image: toImage(result.rows[0]) });
  } catch (err) {
    // 23505 = unique violation: this image is already in the collection
    if ((err as { code?: string }).code === "23505") {
      throw new HttpError(409, "Image already saved in this collection");
    }
    throw err;
  }
}

// PATCH /api/collections/:id/images/:imageId (owner or editor)
export async function updateImage(req: Request, res: Response) {
  const collectionId = parseId(req.params.id, "collection id");
  const imageId = parseId(req.params.imageId, "image id");
  const userId = getUserId(req);
  const { collection } = await requireCollectionAccess(
    collectionId,
    userId,
    "editor"
  );

  const tags = optionalString(req.body?.tags, "tags", 500);
  const note = optionalString(req.body?.note, "note", 1000);

  // COALESCE keeps the existing value when a field is not provided
  const result = await pool.query(
    `UPDATE images
     SET tags = COALESCE($3, tags), note = COALESCE($4, note)
     WHERE id = $1 AND collection_id = $2
     RETURNING *`,
    [imageId, collectionId, tags ?? null, note ?? null]
  );
  if (!result.rows[0]) {
    throw new HttpError(404, "Image not found");
  }

  await notifyCollectionMembers(
    collectionId,
    userId,
    `edited an image in "${collection.name}"`
  );
  res.json({ image: toImage(result.rows[0]) });
}

// DELETE /api/collections/:id/images/:imageId (owner or editor)
export async function deleteImage(req: Request, res: Response) {
  const collectionId = parseId(req.params.id, "collection id");
  const imageId = parseId(req.params.imageId, "image id");
  const userId = getUserId(req);
  const { collection } = await requireCollectionAccess(
    collectionId,
    userId,
    "editor"
  );

  const result = await pool.query(
    "DELETE FROM images WHERE id = $1 AND collection_id = $2 RETURNING id",
    [imageId, collectionId]
  );
  if (!result.rows[0]) {
    throw new HttpError(404, "Image not found");
  }

  await notifyCollectionMembers(
    collectionId,
    userId,
    `removed an image from "${collection.name}"`
  );
  res.status(204).send();
}