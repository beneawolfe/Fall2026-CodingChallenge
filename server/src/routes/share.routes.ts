import { Router } from "express";
import { getSharedCollection } from "../controllers/share.controller";

const router = Router();

// Public: anyone with the link can view, no account required
router.get("/:token", getSharedCollection);

export default router;