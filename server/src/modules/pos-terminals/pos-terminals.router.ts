import { Request, Response, Router } from 'express';
import { PosTerminalsController } from './pos-terminals.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();
const controller = new PosTerminalsController();

// All POS terminal routes require authentication
router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => controller.list(req, res));
router.post('/', (req: Request, res: Response) => controller.create(req, res));
router.post('/bulk-save', (req: Request, res: Response) => controller.bulkSave(req, res));
router.put('/:id', (req: Request, res: Response) => controller.update(req, res));
router.delete('/:id', (req: Request, res: Response) => controller.remove(req, res));

export default router;

