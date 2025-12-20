import { Request, Response, Router } from 'express';
import { SuppliersController } from './suppliers.controller';

const router = Router();
const controller = new SuppliersController();

router.get('/', (req: Request, res: Response) => controller.list(req, res));
router.post('/', (req: Request, res: Response) => controller.create(req, res));
router.post('/bulk-save', (req: Request, res: Response) => controller.bulkSave(req, res));
router.put('/:id', (req: Request, res: Response) => controller.update(req, res));
router.delete('/:id', (req: Request, res: Response) => controller.remove(req, res));

export default router;

