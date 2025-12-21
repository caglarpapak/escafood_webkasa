import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { CustomersService } from './customers.service';
import { customerIdParamSchema, bulkSaveCustomerSchema, createCustomerSchema, deleteCustomerSchema, updateCustomerSchema } from './customers.validation';
import { getUserId, getUserInfo } from '../../config/auth';
import { logAudit, createDiff } from '../auditLog/auditLog.helper';

const service = new CustomersService();

function handleError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', details: error.issues });
  }

  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

export class CustomersController {
  async list(_req: Request, res: Response) {
    try {
      const customers = await service.getAllCustomers();
      res.json(customers);
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const payload = createCustomerSchema.parse(req.body);
      // İŞLEM LOGU (AUDIT LOG) - 8.1: Tekil müşteri ekleme loglanır
      const { userId: createdBy, userEmail } = await getUserInfo(req);
      const customer = await service.createCustomer(payload, createdBy);
      
      await logAudit(
        userEmail,
        'CREATE',
        'CUSTOMER',
        `Müşteri oluşturuldu: ${customer.name}`,
        customer.id,
        { customer: { name: customer.name, phone: customer.phone, email: customer.email } }
      );
      
      res.status(201).json(customer);
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const params = customerIdParamSchema.parse(req.params);
      const payload = updateCustomerSchema.parse(req.body);
      const updatedBy = getUserId(req);
      const customer = await service.updateCustomer(params.id, payload, updatedBy);
      res.json(customer);
    } catch (error) {
      handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const params = customerIdParamSchema.parse(req.params);
      deleteCustomerSchema.parse(req.body); // Validate but don't use payload
      const deletedBy = getUserId(req);
      const customer = await service.softDeleteCustomer(params.id, deletedBy);
      res.json(customer);
    } catch (error) {
      handleError(res, error);
    }
  }

  async bulkSave(req: Request, res: Response) {
    try {
      const rawPayload = bulkSaveCustomerSchema.parse(req.body);
      // İŞLEM LOGU (AUDIT LOG) - 8.1: CSV importlar loglanır
      const { userId, userEmail } = await getUserInfo(req);
      const customers = await service.bulkSaveCustomers(rawPayload, userId);
      
      await logAudit(
        userEmail,
        'IMPORT',
        'CUSTOMER',
        `${customers.length} müşteri CSV'den içe aktarıldı`,
        null,
        { count: customers.length, customers: customers.map(c => ({ id: c.id, name: c.name })) }
      );
      
      res.json(customers);
    } catch (error) {
      handleError(res, error);
    }
  }
}

