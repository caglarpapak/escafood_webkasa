import { Router } from 'express';
import {
  listCreditCards,
  getCreditCard,
  createCreditCard,
  updateCreditCard,
  createExpense,
  createPayment,
  bulkSaveCreditCards,
} from './creditCards.controller';
import {
  createCreditCardSchema,
  updateCreditCardSchema,
  createExpenseSchema,
  createPaymentSchema,
  bulkSaveSchema,
} from './creditCards.validation';
import { z } from 'zod';

const router = Router();

/**
 * Validation middleware
 */
function validate(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: 'Validation error',
          errors: error.errors,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Routes
 */
router.get('/', listCreditCards);
router.post('/bulk-save', validate(bulkSaveSchema), bulkSaveCreditCards);
router.post('/', validate(createCreditCardSchema), createCreditCard);
router.get('/:id', getCreditCard);
router.put('/:id', validate(updateCreditCardSchema), updateCreditCard);
router.post('/expense', validate(createExpenseSchema), createExpense);
router.post('/payment', validate(createPaymentSchema), createPayment);

export default router;
