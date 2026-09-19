import { Router } from "express";
import {
  createCollection,
  deleteCollection,
  getCollection,
  listCollections,
  updateCollection,
} from "../controllers/collections.controller";
import {
  addImage,
  deleteImage,
  updateImage,
} from "../controllers/images.controller";
import {
  addMember,
  listMembers,
  removeMember,
  updateMember,
} from "../controllers/members.controller";
import { regenerateShareToken } from "../controllers/share.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Every collection route requires a logged-in user
router.use(requireAuth);

router.get("/", listCollections);
router.post("/", createCollection);
router.get("/:id", getCollection);
router.patch("/:id", updateCollection);
router.delete("/:id", deleteCollection);

router.post("/:id/images", addImage);
router.patch("/:id/images/:imageId", updateImage);
router.delete("/:id/images/:imageId", deleteImage);

router.get("/:id/members", listMembers);
router.post("/:id/members", addMember);
router.patch("/:id/members/:userId", updateMember);
router.delete("/:id/members/:userId", removeMember);

router.post("/:id/share-token", regenerateShareToken);

export default router;