import { Request, Response, Router } from 'express';
import { AdminController } from './admin.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();
const controller = new AdminController();

// All admin routes require authentication
router.use(authMiddleware);

router.post('/clear-all-data', (req: Request, res: Response) => controller.clearAllData(req, res));

export default router;

