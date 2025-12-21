import { prisma } from '../../config/prisma';
import { PosTerminalRecord, CreatePosTerminalDTO, UpdatePosTerminalDTO, BulkSavePosTerminalDTO } from './pos-terminals.types';
import { BadRequestError } from '../../utils/errors';

export class PosTerminalsService {
  async getAllPosTerminals(): Promise<PosTerminalRecord[]> {
    return prisma.posTerminal.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }).then(terminals => terminals.map(t => ({
      id: t.id,
      bankId: t.bankId,
      name: t.name,
      commissionRate: Number(t.commissionRate),
      isActive: t.isActive,
      createdAt: t.createdAt,
      createdBy: t.createdBy,
      updatedAt: t.updatedAt,
      updatedBy: t.updatedBy,
      deletedAt: t.deletedAt,
      deletedBy: t.deletedBy,
    })));
  }

  async createPosTerminal(payload: CreatePosTerminalDTO, createdBy: string): Promise<PosTerminalRecord> {
    const created = await prisma.posTerminal.create({
      data: {
        bankId: payload.bankId,
        name: payload.name,
        commissionRate: payload.commissionRate,
        isActive: payload.isActive ?? true,
        createdBy,
      },
    });
    return {
      ...created,
      commissionRate: Number(created.commissionRate),
    };
  }

  async updatePosTerminal(id: string, payload: UpdatePosTerminalDTO, updatedBy: string): Promise<PosTerminalRecord> {
    const existing = await prisma.posTerminal.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new BadRequestError('POS terminal not found.');
    }

    const data: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy,
    };

    if (payload.bankId !== undefined) data.bankId = payload.bankId;
    if (payload.name !== undefined) data.name = payload.name;
    if (payload.commissionRate !== undefined) data.commissionRate = payload.commissionRate;
    if (payload.isActive !== undefined) data.isActive = payload.isActive;

    const updated = await prisma.posTerminal.update({
      where: { id },
      data: data,
    });
    return {
      ...updated,
      commissionRate: Number(updated.commissionRate),
    };
  }

  async softDeletePosTerminal(id: string, deletedBy: string): Promise<PosTerminalRecord> {
    const existing = await prisma.posTerminal.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw new BadRequestError('POS terminal not found or already deleted.');
    }

    const deleted = await prisma.posTerminal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
    return {
      ...deleted,
      commissionRate: Number(deleted.commissionRate),
    };
  }

  async bulkSavePosTerminals(payload: BulkSavePosTerminalDTO, userId: string): Promise<PosTerminalRecord[]> {
    if (payload.length === 0) {
      throw new BadRequestError("Payload cannot be an empty array for bulk save. Use DELETE for removal.");
    }

    const results: PosTerminalRecord[] = [];
    for (const item of payload) {
      if (item.id.startsWith('tmp-')) {
        // Create new POS terminal
        const created = await this.createPosTerminal(
          {
            bankId: item.bankaId,
            name: item.posAdi,
            commissionRate: item.komisyonOrani,
            isActive: item.aktifMi,
          },
          userId
        );
        results.push(created);
      } else {
        // Check if terminal exists before trying to update
        const existing = await prisma.posTerminal.findUnique({ where: { id: item.id } });
        if (!existing || existing.deletedAt) {
          // Terminal doesn't exist or is deleted - treat as new terminal
          const created = await this.createPosTerminal(
            {
              bankId: item.bankaId,
              name: item.posAdi,
              commissionRate: item.komisyonOrani,
              isActive: item.aktifMi,
            },
            userId
          );
          results.push(created);
        } else {
          // Update existing POS terminal
          const updated = await this.updatePosTerminal(
            item.id,
            {
              bankId: item.bankaId,
              name: item.posAdi,
              commissionRate: item.komisyonOrani,
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

