import { prisma } from '../../config/prisma';
import { SupplierRecord, CreateSupplierDTO, UpdateSupplierDTO, BulkSaveSupplierDTO } from './suppliers.types';
import { BadRequestError } from '../../utils/errors';

export class SuppliersService {
  async getAllSuppliers(): Promise<SupplierRecord[]> {
    return prisma.supplier.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async createSupplier(payload: CreateSupplierDTO, createdBy: string): Promise<SupplierRecord> {
    return prisma.supplier.create({
      data: {
        name: payload.name,
        phone: payload.phone ?? null,
        email: payload.email ?? null,
        taxNo: payload.taxNo ?? null,
        address: payload.address ?? null,
        createdBy,
      },
    });
  }

  async updateSupplier(id: string, payload: UpdateSupplierDTO, updatedBy: string): Promise<SupplierRecord> {
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new BadRequestError('Supplier not found.');
    }

    const data: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy,
    };

    if (payload.name !== undefined) data.name = payload.name;
    if (payload.phone !== undefined) data.phone = payload.phone ?? null;
    if (payload.email !== undefined) data.email = payload.email ?? null;
    if (payload.taxNo !== undefined) data.taxNo = payload.taxNo ?? null;
    if (payload.address !== undefined) data.address = payload.address ?? null;
    if (payload.isActive !== undefined) data.isActive = payload.isActive;

    return prisma.supplier.update({
      where: { id },
      data: data,
    });
  }

  async softDeleteSupplier(id: string, deletedBy: string): Promise<SupplierRecord> {
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new BadRequestError('Supplier not found or already deleted.');
    }

    return prisma.supplier.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  async bulkSaveSuppliers(payload: BulkSaveSupplierDTO, userId: string): Promise<SupplierRecord[]> {
    if (payload.length === 0) {
      throw new BadRequestError("Payload cannot be an empty array for bulk save. Use DELETE for removal.");
    }

    const results: SupplierRecord[] = [];
    for (const item of payload) {
      if (item.id.startsWith('tmp-')) {
        // Create new supplier
        const created = await this.createSupplier(
          {
            name: `${item.kod} - ${item.ad}`, // Convert to "kod - ad" format
            phone: null,
            email: null,
            taxNo: null,
            address: null,
          },
          userId
        );
        results.push(created);
      } else {
        // Check if supplier exists before trying to update
        const existing = await prisma.supplier.findUnique({ where: { id: item.id } });
        if (!existing || existing.deletedAt) {
          // Supplier doesn't exist or is deleted - treat as new supplier
          const created = await this.createSupplier(
            {
              name: `${item.kod} - ${item.ad}`, // Convert to "kod - ad" format
              phone: null,
              email: null,
              taxNo: null,
              address: null,
            },
            userId
          );
          results.push(created);
        } else {
          // Update existing supplier
          const updated = await this.updateSupplier(
            item.id,
            {
              name: `${item.kod} - ${item.ad}`, // Convert to "kod - ad" format
              isActive: item.aktifMi,
            },
            userId
          );
          results.push(updated);
        }
      }
    }
    return results;
  }
}

