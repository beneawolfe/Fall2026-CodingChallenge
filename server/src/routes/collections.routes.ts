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

export default router;