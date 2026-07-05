import { Router } from 'express';
import { createNotification } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.post('/', createNotification);

export default router;
