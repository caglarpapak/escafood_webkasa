import { Request, Response } from 'express';
import { CreditCardsService } from './creditCards.service';
import {
  CreateCreditCardDto,
  UpdateCreditCardDto,
  CreateExpenseDto,
  CreatePaymentDto,
  BulkSaveCreditCardDto,
} from './creditCards.types';
import { getUserId } from '../../config/auth';

const creditCardsService = new CreditCardsService();

export async function listCreditCards(req: Request, res: Response): Promise<void> {
  try {
    const cards = await creditCardsService.listCreditCards();
    res.json(cards);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to list credit cards' });
  }
}

export async function getCreditCard(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const card = await creditCardsService.getCreditCardById(id);
    if (!card) {
      res.status(404).json({ message: 'Credit card not found' });
      return;
    }
    res.json(card);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to get credit card' });
  }
}

export async function createCreditCard(req: Request, res: Response): Promise<void> {
  const data = req.body as CreateCreditCardDto;
  const createdBy = getUserId(req);

  try {
    const card = await creditCardsService.createCreditCard(data, createdBy);
    res.status(201).json(card);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create credit card' });
  }
}

export async function updateCreditCard(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const data = req.body as UpdateCreditCardDto;
  const updatedBy = getUserId(req);

  try {
    const card = await creditCardsService.updateCreditCard(id, data, updatedBy);
    res.json(card);
  } catch (error: any) {
    if (error.message === 'Credit card not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error.message === 'Cannot update deleted credit card') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message || 'Failed to update credit card' });
  }
}

export async function createExpense(req: Request, res: Response): Promise<void> {
  const data = req.body as CreateExpenseDto;
  const createdBy = getUserId(req);

  try {
    const result = await creditCardsService.createExpense(data, createdBy);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Credit card not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(400).json({ message: error.message || 'Failed to create expense' });
  }
}

export async function createPayment(req: Request, res: Response): Promise<void> {
  const data = req.body as CreatePaymentDto;
  const createdBy = getUserId(req);

  try {
    const result = await creditCardsService.createPayment(data, createdBy);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Credit card not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error.message.includes('bankId is required')) {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(400).json({ message: error.message || 'Failed to create payment' });
  }
}

export async function bulkSaveCreditCards(req: Request, res: Response): Promise<void> {
  const { cards } = req.body as { cards: BulkSaveCreditCardDto[] };
  const userId = getUserId(req);

  try {
    const saved = await creditCardsService.bulkSave(cards || [], userId);
    res.json(saved);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to bulk save credit cards' });
  }
}
