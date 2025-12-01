import { Request, Response, Router } from 'express';
import { TransactionsController } from './transactions.controller';

const router = Router();
const controller = new TransactionsController();

router.post('/', (req: Request, res: Response) => controller.create(req, res));
router.get('/', (req: Request, res: Response) => controller.list(req, res));
router.put('/:id', (req: Request, res: Response) => controller.update(req, res));
router.delete('/:id', (req: Request, res: Response) => controller.remove(req, res));

export default router;
