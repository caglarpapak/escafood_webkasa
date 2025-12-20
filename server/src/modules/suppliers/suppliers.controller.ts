import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { SuppliersService } from './suppliers.service';
import { bulkSaveSupplierSchema, createSupplierSchema, supplierIdParamSchema, deleteSupplierSchema, updateSupplierSchema } from './suppliers.validation';
import { getUserId } from '../../config/auth';
import { BadRequestError } from '../../utils/errors';

const service = new SuppliersService();

function handleError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', details: error.issues });
  }
  if (error instanceof BadRequestError) {
    return res.status(400).json({ message: error.message });
  }
  if (error instanceof Error) {
    return res.status(400).json({ message: (error as Error).message });
  }
  return res.status(500).json({ message: 'Internal server error' });
}

export class SuppliersController {
  async list(_req: Request, res: Response) {
    try {
      const suppliers = await service.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const payload = createSupplierSchema.parse(req.body);
      const createdBy = getUserId(req);
      const supplier = await service.createSupplier(payload, createdBy);
      res.status(201).json(supplier);
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const params = supplierIdParamSchema.parse(req.params);
      const payload = updateSupplierSchema.parse(req.body);
      const updatedBy = getUserId(req);
      const supplier = await service.updateSupplier(params.id, payload, updatedBy);
      res.json(supplier);
    } catch (error) {
      handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const params = supplierIdParamSchema.parse(req.params);
      deleteSupplierSchema.parse(req.body); // Validate but don't use payload
      const deletedBy = getUserId(req);
      const supplier = await service.softDeleteSupplier(params.id, deletedBy);
      res.json(supplier);
    } catch (error) {
      handleError(res, error);
    }
  }

  async bulkSave(req: Request, res: Response) {
    try {
      const payload = bulkSaveSupplierSchema.parse(req.body);
      const userId = getUserId(req);
      const suppliers = await service.bulkSaveSuppliers(payload, userId);
      res.json(suppliers);
    } catch (error) {
      handleError(res, error);
    }
  }
}

