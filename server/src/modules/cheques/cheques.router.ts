import { Request, Response, Router } from 'express';
import { ChequesController } from './cheques.controller';

const router = Router();
const controller = new ChequesController();

router.get('/', (req: Request, res: Response) => controller.list(req, res));
router.post('/', (req: Request, res: Response) => controller.create(req, res));
router.put('/:id', (req: Request, res: Response) => controller.update(req, res));
router.put('/:id/status', (req: Request, res: Response) => controller.updateStatus(req, res));

export default router;
