import { Router } from "express";
import {
  listNotifications,
  markAllRead,
  markRead,
} from "../controllers/notifications.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", listNotifications);
router.post("/read-all", markAllRead);
router.post("/:id/read", markRead);

export default router;