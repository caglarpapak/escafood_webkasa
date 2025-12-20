import { Request, Response, Router } from 'express';
import { LoansController } from './loans.controller';

const router = Router();
const controller = new LoansController();

router.get('/', (req: Request, res: Response) => controller.list(req, res));
router.get('/:id', (req: Request, res: Response) => controller.getById(req, res));
router.post('/', (req: Request, res: Response) => controller.create(req, res));
router.put('/:id', (req: Request, res: Response) => controller.update(req, res));
router.delete('/:id', (req: Request, res: Response) => controller.remove(req, res));
router.get('/:id/installments', (req: Request, res: Response) => controller.getInstallments(req, res));
router.post('/:loanId/installments/:installmentId/pay', (req: Request, res: Response) => controller.payInstallment(req, res));
router.post('/:id/pay-next-installment', (req: Request, res: Response) => controller.payNextInstallment(req, res));

export default router;

