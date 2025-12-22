import { Request, Response, Router } from 'express';
import { ChequesController } from './cheques.controller';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();
const controller = new ChequesController();

// All cheque routes require authentication
router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => controller.list(req, res));
router.get('/payable', (req: Request, res: Response) => controller.getPayableCheques(req, res));
router.post('/', (req: Request, res: Response) => controller.create(req, res));
router.put('/:id', (req: Request, res: Response) => controller.update(req, res));
router.put('/:id/status', (req: Request, res: Response) => controller.updateStatus(req, res));
router.post('/:id/pay', (req: Request, res: Response) => controller.payCheque(req, res));

export default router;
