import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { TransactionsService } from './transactions.service';
import {
  createTransactionSchema,
  deleteTransactionSchema,
  transactionQuerySchema,
  updateTransactionSchema,
} from './transactions.validation';
import { getUserId, getUserInfo } from '../../config/auth';
import { logAudit } from '../auditLog/auditLog.helper';

const service = new TransactionsService();

function handleError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', details: error.issues });
  }

  // Check for client errors (e.g., bank not found)
  if (error instanceof Error) {
    // Check if this is a client error (marked by service layer)
    if ((error as any).isClientError || (error as any).statusCode === 400) {
      console.error('Client error:', error.message);
      return res.status(400).json({ 
        message: error.message || 'Bad request',
        error: error.message 
      });
    }

    // Prisma errors and other runtime errors should be 500
    // Log the error for debugging (in production, use proper logging)
    console.error('Transaction error:', error.message);
    console.error('Stack:', error.stack);
    // In development, return the actual error message for debugging
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ 
        message: 'Internal server error', 
        error: error.message,
        stack: error.stack 
      });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

export class TransactionsController {
  async create(req: Request, res: Response) {
    try {
      console.log('=== CREATE TRANSACTION CONTROLLER ===');
      console.log('Raw request body:', JSON.stringify(req.body, null, 2));
      console.log('Request headers:', JSON.stringify(req.headers, null, 2));
      
      const payload = createTransactionSchema.parse(req.body);
      console.log('Validated payload:', JSON.stringify(payload, null, 2));
      
      // KULLANICI / AUTH / AUDIT - 7.1 & 7.2: Transaction kaydında gerçek kullanıcı resolve edilmek zorunda
      const { userId, userEmail } = await getUserInfo(req);
      console.log('Created by user ID:', userId);
      console.log('Created by user email:', userEmail);
      
      const transaction = await service.createTransaction(payload, userId, userEmail);
      console.log('Transaction created successfully, returning 201');
      
      // İŞLEM LOGU (AUDIT LOG) - 8.1: Tüm + / - transactionlar loglanır
      await logAudit(
        userEmail,
        'CREATE',
        'TRANSACTION',
        `Transaction oluşturuldu: ${transaction.type} - ${transaction.documentNo || 'Belge No yok'}`,
        transaction.id,
        { transaction: { type: transaction.type, documentNo: transaction.documentNo, amount: transaction.incoming || transaction.outgoing || transaction.bankDelta } }
      );
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error('=== CREATE TRANSACTION ERROR ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      if (error instanceof Error && 'issues' in error) {
        console.error('Validation issues:', (error as any).issues);
      }
      handleError(res, error);
    }
  }

  async list(req: Request, res: Response) {
    try {
      const query = transactionQuerySchema.parse(req.query);
      const result = await service.listTransactions(query);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const payload = updateTransactionSchema.parse(req.body);
      // İŞLEM LOGU (AUDIT LOG) - 8.1: Tüm + / - transactionlar loglanır
      const { userId: updatedBy, userEmail } = await getUserInfo(req);
      const existing = await service.getTransactionById(req.params.id);
      const transaction = await service.updateTransaction(req.params.id, payload, updatedBy);
      
      if (existing) {
        await logAudit(
          userEmail,
          'UPDATE',
          'TRANSACTION',
          `Transaction güncellendi: ${transaction.type} - ${transaction.documentNo || 'Belge No yok'}`,
          transaction.id,
          { before: { type: existing.type, documentNo: existing.documentNo, incoming: existing.incoming, outgoing: existing.outgoing, bankDelta: existing.bankDelta }, after: { type: transaction.type, documentNo: transaction.documentNo, incoming: transaction.incoming, outgoing: transaction.outgoing, bankDelta: transaction.bankDelta } }
        );
      }
      
      res.json(transaction);
    } catch (error) {
      handleError(res, error);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const transaction = await service.getTransactionById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      res.json(transaction);
    } catch (error) {
      handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      // İŞLEM LOGU (AUDIT LOG) - 8.1: Tüm + / - transactionlar loglanır
      const { userId: deletedBy, userEmail } = await getUserInfo(req);
      const existing = await service.getTransactionById(req.params.id);
      await service.deleteTransaction(req.params.id, deletedBy);
      
      if (existing) {
        await logAudit(
          userEmail,
          'DELETE',
          'TRANSACTION',
          `Transaction silindi: ${existing.type} - ${existing.documentNo || 'Belge No yok'}`,
          existing.id,
          { transaction: { type: existing.type, documentNo: existing.documentNo } }
        );
      }
      
      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  }
}
