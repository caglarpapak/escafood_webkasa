import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { CustomersService } from './customers.service';
import { customerIdParamSchema, bulkSaveCustomerSchema, createCustomerSchema, deleteCustomerSchema, updateCustomerSchema } from './customers.validation';
import { getUserId } from '../../config/auth';

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
      const createdBy = getUserId(req);
      const customer = await service.createCustomer(payload, createdBy);
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
      const userId = getUserId(req);
      const customers = await service.bulkSaveCustomers(rawPayload, userId);
      res.json(customers);
    } catch (error) {
      handleError(res, error);
    }
  }
}

