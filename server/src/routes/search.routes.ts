import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { searchImages } from '../controllers/search.controller.js';

const router = Router();

// All search routes require a logged-in user
router.use(requireAuth);

router.get('/images', searchImages);

export default router;