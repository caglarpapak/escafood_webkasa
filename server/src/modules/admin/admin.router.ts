import { Request, Response, Router } from 'express';
import { AdminController } from './admin.controller';

const router = Router();
const controller = new AdminController();

router.post('/clear-all-data', (req: Request, res: Response) => controller.clearAllData(req, res));

export default router;

