import { Request, Response, Router } from 'express';
import { TransactionsController } from './transactions.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();
const controller = new TransactionsController();

// All transaction routes require authentication
router.use(authMiddleware);

router.post('/', (req: Request, res: Response) => controller.create(req, res));
router.get('/', (req: Request, res: Response) => controller.list(req, res));
router.get('/:id', (req: Request, res: Response) => controller.getById(req, res));
router.put('/:id', (req: Request, res: Response) => controller.update(req, res));
router.delete('/:id', (req: Request, res: Response) => controller.remove(req, res));

export default router;
