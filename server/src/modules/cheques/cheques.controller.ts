import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ChequesService } from './cheques.service';
import {
  chequeIdParamSchema,
  chequeQuerySchema,
  createChequeSchema,
  updateChequeSchema,
  updateChequeStatusSchema,
  payableChequesQuerySchema,
  payChequeSchema,
} from './cheques.validation';
import { ChequeListQuery } from './cheques.types';
import { ChequeStatus } from '@prisma/client';
import { getUserId, getUserInfo } from '../../config/auth';

const service = new ChequesService();

function handleError(res: Response, error: unknown) {
  console.error('handleError called with:', {
    errorType: typeof error,
    errorConstructor: error?.constructor?.name,
    isError: error instanceof Error,
    isZodError: error instanceof ZodError,
    errorValue: error
  });

  if (error instanceof ZodError) {
    console.error('Zod validation error:', error.issues);
    return res.status(400).json({ message: 'Validation error', details: error.issues });
  }

  if (error instanceof Error) {
    console.error('Cheque service error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    // Check if it's a Prisma error
    if ((error as any).code && (error as any).code.startsWith('P')) {
      console.error('Prisma error detected:', {
        code: (error as any).code,
        meta: (error as any).meta
      });
      return res.status(500).json({ 
        message: 'Database error',
        error: error.message,
        code: (error as any).code,
        meta: (error as any).meta,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
    // Always return error message in development, and in production if it's a known error
    const responseData = { 
      message: error.message || 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
    console.error('Sending error response:', responseData);
    return res.status(500).json(responseData);
  }

  console.error('Unknown error type:', error);
  const responseData = { 
    message: 'Internal server error',
    error: String(error)
  };
  console.error('Sending unknown error response:', responseData);
  return res.status(500).json(responseData);
}

export class ChequesController {
  async list(req: Request, res: Response) {
    try {
      const rawQuery = chequeQuerySchema.parse(req.query);
      // Type assertion: status can be 'ALL' but service expects ChequeStatus | undefined
      const query: ChequeListQuery = {
        ...rawQuery,
        status: rawQuery.status === 'ALL' ? undefined : rawQuery.status as ChequeStatus | undefined,
      };
      const cheques = await service.listCheques(query);
      res.json(cheques);
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      console.log('Cheque create request received');
      const payload = createChequeSchema.parse(req.body);
      console.log('Payload validated:', { 
        cekNo: payload.cekNo, 
        amount: payload.amount,
        direction: payload.direction,
        issuerBankName: payload.issuerBankName,
        drawerName: payload.drawerName,
        hasImageDataUrl: !!payload.imageDataUrl 
      });
      const createdBy = getUserId(req);
      console.log('Created by user ID:', createdBy);
      const cheque = await service.createCheque(payload, createdBy);
      console.log('Cheque created successfully:', cheque.id);
      res.status(201).json(cheque);
    } catch (error) {
      console.error('Error in cheque create controller:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const params = chequeIdParamSchema.parse(req.params);
      const payload = updateChequeSchema.parse(req.body);
      const updatedBy = getUserId(req);
      const cheque = await service.updateCheque(params.id, payload, updatedBy);
      res.json(cheque);
    } catch (error) {
      handleError(res, error);
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const params = chequeIdParamSchema.parse(req.params);
      const payload = updateChequeStatusSchema.parse(req.body);
      // KULLANICI / AUTH / AUDIT - 7.1 & 7.2: Transaction kaydında gerçek kullanıcı resolve edilmek zorunda
      const { userId, userEmail } = await getUserInfo(req);
      const result = await service.updateChequeStatus(params.id, payload, userId, userEmail);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }

  async getPayableCheques(req: Request, res: Response) {
    try {
      const query = payableChequesQuerySchema.parse(req.query);
      const cheques = await service.getPayableCheques(query.bankId);
      res.json(cheques);
    } catch (error) {
      handleError(res, error);
    }
  }

  async payCheque(req: Request, res: Response) {
    try {
      const params = chequeIdParamSchema.parse(req.params);
      const payload = payChequeSchema.parse(req.body);
      // KULLANICI / AUTH / AUDIT - 7.1 & 7.2: Transaction kaydında gerçek kullanıcı resolve edilmek zorunda
      const { userId, userEmail } = await getUserInfo(req);
      const result = await service.payCheque(params.id, payload, userId, userEmail);
      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  }
}
