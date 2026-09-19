import { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../errors";
import { getUserId, parseId } from "../services/access";

// GET /api/notifications: latest 50 plus the unread count
export async function listNotifications(req: Request, res: Response) {
  const userId = getUserId(req);

  const result = await pool.query(
    `SELECT n.id, n.collection_id, c.name AS collection_name,
            n.message, n.is_read, n.created_at
     FROM notifications n
     JOIN collections c ON c.id = n.collection_id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT 50`,
    [userId]
  );
  const unread = await pool.query(
    "SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND NOT is_read",
    [userId]
  );

  res.json({
    unreadCount: unread.rows[0].count,
    notifications: result.rows.map((row) => ({
      id: row.id,
      collectionId: row.collection_id,
      collectionName: row.collection_name,
      message: row.message,
      isRead: row.is_read,
      createdAt: row.created_at,
    })),
  });
}

// POST /api/notifications/:id/read
export async function markRead(req: Request, res: Response) {
  const notificationId = parseId(req.params.id, "notification id");
  const result = await pool.query(
    `UPDATE notifications SET is_read = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [notificationId, getUserId(req)]
  );
  if (!result.rows[0]) {
    throw new HttpError(404, "Notification not found");
  }
  res.status(204).send();
}

// POST /api/notifications/read-all
export async function markAllRead(req: Request, res: Response) {
  await pool.query(
    "UPDATE notifications SET is_read = TRUE WHERE user_id = $1",
    [getUserId(req)]
  );
  res.status(204).send();
}