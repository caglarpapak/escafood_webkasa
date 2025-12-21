import { Request, Response } from 'express';
import { CreditCardsService } from './creditCards.service';
import {
  CreateCreditCardDto,
  UpdateCreditCardDto,
  CreateExpenseDto,
  CreatePaymentDto,
} from './creditCards.types';
import { getUserId, getUserInfo } from '../../config/auth';
import { bulkSaveCreditCardSchema } from './creditCards.validation';

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

export async function deleteCreditCard(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const deletedBy = getUserId(req);

  try {
    await creditCardsService.softDeleteCreditCard(id, deletedBy);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Credit card not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: error.message || 'Failed to delete credit card' });
  }
}

export async function createExpense(req: Request, res: Response): Promise<void> {
  const data = req.body as CreateExpenseDto;
  // KULLANICI / AUTH / AUDIT - 7.1 & 7.2: Transaction kaydında gerçek kullanıcı resolve edilmek zorunda
  const { userId, userEmail } = await getUserInfo(req);

  try {
    const result = await creditCardsService.createExpense(data, userId, userEmail);
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
  // KULLANICI / AUTH / AUDIT - 7.1 & 7.2: Transaction kaydında gerçek kullanıcı resolve edilmek zorunda
  const { userId, userEmail } = await getUserInfo(req);

  try {
    const result = await creditCardsService.createPayment(data, userId, userEmail);
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

export async function bulkSave(req: Request, res: Response): Promise<void> {
  try {
    const rawPayload = bulkSaveCreditCardSchema.parse(req.body);
    
    // Normalize undefined to null for optional fields
    // CRITICAL FIX: Include sonEkstreBorcu and manualGuncelBorc in payload
    const payload = rawPayload.map((item) => ({
      id: item.id,
      name: item.name,
      bankId: item.bankId ?? null,
      limit: item.limit ?? null,
      closingDay: item.closingDay ?? null,
      dueDay: item.dueDay ?? null,
      sonEkstreBorcu: item.sonEkstreBorcu, // Include this field (can be 0, number, or undefined)
      manualGuncelBorc: item.manualGuncelBorc ?? null, // Include this field (can be null, number, or undefined)
      isActive: item.isActive ?? true,
    }));
    
    const userId = getUserId(req);
    const cards = await creditCardsService.bulkSaveCreditCards(payload, userId);
    res.json(cards);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ message: 'Validation error', errors: error.errors });
      return;
    }
    res.status(500).json({ message: error.message || 'Failed to bulk save credit cards' });
  }
}

