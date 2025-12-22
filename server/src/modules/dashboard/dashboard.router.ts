import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();
const controller = new DashboardController();

// All dashboard routes require authentication
router.use(authMiddleware);

router.get('/summary', controller.getSummary.bind(controller));

export default router;

