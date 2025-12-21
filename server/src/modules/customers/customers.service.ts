import { prisma } from '../../config/prisma';
import { CustomerRecord, CreateCustomerDTO, UpdateCustomerDTO, BulkSaveCustomerDTO } from './customers.types';

export class CustomersService {
  async getAllCustomers(): Promise<CustomerRecord[]> {
    return prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async createCustomer(payload: CreateCustomerDTO, createdBy: string): Promise<CustomerRecord> {
    const created = await prisma.customer.create({
      data: {
        name: payload.name,
        phone: payload.phone ?? null,
        email: payload.email ?? null,
        taxNo: payload.taxNo ?? null,
        address: payload.address ?? null,
        createdBy,
      },
    });
    return created;
  }

  async updateCustomer(id: string, payload: UpdateCustomerDTO, updatedBy: string): Promise<CustomerRecord> {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error('Customer not found.');
    }

    const data: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy,
    };

    if (payload.name !== undefined) {
      data.name = payload.name;
    }
    if (payload.phone !== undefined) {
      data.phone = payload.phone ?? null;
    }
    if (payload.email !== undefined) {
      data.email = payload.email ?? null;
    }
    if (payload.taxNo !== undefined) {
      data.taxNo = payload.taxNo ?? null;
    }
    if (payload.address !== undefined) {
      data.address = payload.address ?? null;
    }
    if (payload.isActive !== undefined) {
      data.isActive = payload.isActive;
    }

    const updated = await prisma.customer.update({
      where: { id },
      data,
    });
    return updated;
  }

  async softDeleteCustomer(id: string, deletedBy: string): Promise<CustomerRecord> {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new Error('Customer not found.');
    }

    const deleted = await prisma.customer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
    return deleted;
  }

  /**
   * Bulk save customers (upsert)
   * CRITICAL: Empty array is rejected (400 Bad Request) to prevent accidental data loss
   */
  async bulkSaveCustomers(payload: BulkSaveCustomerDTO, userId: string): Promise<CustomerRecord[]> {
    // CRITICAL SAFETY: Reject empty array to prevent accidental data loss
    if (payload.length === 0) {
      throw new Error('Cannot save empty customer list. This would delete all customers. If you want to delete all customers, do it explicitly.');
    }

    const results: CustomerRecord[] = [];

    for (const item of payload) {
      // Convert frontend format (kod, ad) to backend format (name = "kod - ad")
      const name = `${item.kod} - ${item.ad}`;

      if (item.id.startsWith('tmp-')) {
        // Create new customer
        const created = await prisma.customer.create({
          data: {
            name,
            phone: null,
            email: null,
            taxNo: null,
            address: null,
            isActive: item.aktifMi ?? true,
            createdBy: userId,
          },
        });
        results.push(created);
      } else {
        // Check if customer exists before trying to update
        const existing = await prisma.customer.findUnique({ where: { id: item.id } });
        if (!existing || existing.deletedAt) {
          // Customer doesn't exist or is deleted - treat as new customer
          const created = await prisma.customer.create({
            data: {
              name,
              phone: null,
              email: null,
              taxNo: null,
              address: null,
              isActive: item.aktifMi ?? true,
              createdBy: userId,
            },
          });
          results.push(created);
        } else {
          // Update existing customer
          const updated = await prisma.customer.update({
            where: { id: item.id },
            data: {
              name,
              isActive: item.aktifMi ?? true,
              updatedAt: new Date(),
              updatedBy: userId,
            },
          });
          results.push(updated);
        }
      }
    }

    return results;
  }
}

