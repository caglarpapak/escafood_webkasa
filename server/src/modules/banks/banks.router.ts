import { Request, Response, Router } from 'express';
import { BanksController } from './banks.controller';

const router = Router();
const controller = new BanksController();

router.get('/', (req: Request, res: Response) => controller.list(req, res));
router.post('/', (req: Request, res: Response) => controller.create(req, res));
router.put('/:id', (req: Request, res: Response) => controller.update(req, res));
router.delete('/:id', (req: Request, res: Response) => controller.remove(req, res));

export default router;
