import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { SuppliersService } from './suppliers.service';
import { bulkSaveSupplierSchema, createSupplierSchema, supplierIdParamSchema, deleteSupplierSchema, updateSupplierSchema } from './suppliers.validation';
import { getUserId, getUserInfo } from '../../config/auth';
import { logAudit, createDiff } from '../auditLog/auditLog.helper';
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
      // İŞLEM LOGU (AUDIT LOG) - 8.1: Tekil tedarikçi ekleme loglanır
      const { userId: createdBy, userEmail } = await getUserInfo(req);
      const supplier = await service.createSupplier(payload, createdBy);
      
      await logAudit(
        userEmail,
        'CREATE',
        'SUPPLIER',
        `Tedarikçi oluşturuldu: ${supplier.name}`,
        supplier.id,
        { supplier: { name: supplier.name, phone: supplier.phone, email: supplier.email } }
      );
      
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
      // İŞLEM LOGU (AUDIT LOG) - 8.1: CSV importlar loglanır
      const { userId, userEmail } = await getUserInfo(req);
      const suppliers = await service.bulkSaveSuppliers(payload, userId);
      
      await logAudit(
        userEmail,
        'IMPORT',
        'SUPPLIER',
        `${suppliers.length} tedarikçi CSV'den içe aktarıldı`,
        null,
        { count: suppliers.length, suppliers: suppliers.map(s => ({ id: s.id, name: s.name })) }
      );
      
      res.json(suppliers);
    } catch (error) {
      handleError(res, error);
    }
  }
}

