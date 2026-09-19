import { pool } from "../db/pool";

// Notify the owner and every collaborator except the person who made the change.
// Message reads like: "<username> <action>", e.g. 'sam added an image to "Trip"'.
export async function notifyCollectionMembers(
  collectionId: number,
  actorId: number,
  action: string
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, collection_id, message)
       SELECT r.user_id,
              $1::int,
              (SELECT username FROM users WHERE id = $2::int) || ' ' || $3::text
       FROM (
         SELECT owner_id AS user_id FROM collections WHERE id = $1::int
         UNION
         SELECT user_id FROM collection_members WHERE collection_id = $1::int
       ) r
       WHERE r.user_id <> $2::int`,
      [collectionId, actorId, action]
    );
  } catch (err) {
    // Notifications are best-effort and must never break the main request
    console.error("Failed to create notifications", err);
  }
}

// Notify one specific user (used when someone is added, changed, or removed)
export async function notifyUser(
  userId: number,
  collectionId: number,
  actorId: number,
  action: string
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, collection_id, message)
       SELECT $1::int, $2::int, username || ' ' || $4::text
       FROM users WHERE id = $3::int`,
      [userId, collectionId, actorId, action]
    );
  } catch (err) {
    console.error("Failed to create notification", err);
  }
}