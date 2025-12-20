import { prisma } from '../../config/prisma';
import { BankRecord, BankWithBalance, CreateBankDTO, UpdateBankDTO } from './banks.types';

/**
 * Opening balance artık transaction olarak yazılmıyor.
 * Bank.openingBalance alanında tutuluyor.
 *
 * currentBalance = openingBalance + sum(transactions.bankDelta)
 *
 * Legacy (eski) veride "Açılış bakiyesi" açıklamalı transactionlar kalmış olabilir.
 * Bu nedenle groupBy hesaplarından bu satırları filtreliyoruz.
 */

const OPENING_TX_DESC = 'Açılış bakiyesi';

function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export class BanksService {
  async getAllBanksWithBalances(): Promise<BankWithBalance[]> {
    const [banks, deltaGroups] = await prisma.$transaction([
      prisma.bank.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      }),
      prisma.transaction.groupBy({
        by: ['bankId'],
        _sum: { bankDelta: true },
        where: {
          deletedAt: null,
          bankId: { not: null },
          // Legacy opening tx’leri dışarıda bırak
          OR: [{ description: { not: OPENING_TX_DESC } }, { description: null }],
        },
      }),
    ]);

    const deltaMap = new Map<string, number>();
    for (const g of deltaGroups) {
      if (!g.bankId) continue;
      deltaMap.set(g.bankId, toNumber(g._sum?.bankDelta));
    }

    return banks.map((bank) => {
      const openingBalance = toNumber((bank as any).openingBalance);
      const transactionDelta = deltaMap.get(bank.id) ?? 0;
      const currentBalance = openingBalance + transactionDelta;

      return {
        ...(bank as any),
        openingBalance,
        currentBalance,
      };
    });
  }

  async createBank(payload: CreateBankDTO, createdBy: string): Promise<BankWithBalance> {
    const openingBalance = payload.openingBalance ?? 0;

    const created = await prisma.bank.create({
      data: {
        name: payload.name,
        accountNo: payload.accountNo ?? null,
        iban: payload.iban ?? null,
        // openingBalance Bank tablosunda saklanır
        openingBalance: openingBalance !== 0 ? openingBalance : null,
        createdBy,
      } as any,
    });

    // Yeni bankada henüz transaction yok sayılır; ama yine de hesaplayalım:
    const deltaGroups = await prisma.transaction.groupBy({
      by: ['bankId'],
      _sum: { bankDelta: true },
      where: {
        deletedAt: null,
        bankId: created.id,
        OR: [{ description: { not: OPENING_TX_DESC } }, { description: null }],
      },
    });

    const transactionDelta =
      deltaGroups.length > 0 ? toNumber(deltaGroups[0]._sum?.bankDelta) : 0;

    return {
      ...(created as any),
      openingBalance: toNumber((created as any).openingBalance) || openingBalance,
      currentBalance: openingBalance + transactionDelta,
    };
  }

  async updateBank(id: string, payload: UpdateBankDTO, updatedBy: string): Promise<BankWithBalance> {
    const existing = await prisma.bank.findUnique({ where: { id } });
    if (!existing || (existing as any).deletedAt) {
      throw new Error('Bank not found.');
    }

    const data: Record<string, unknown> = {
      updatedAt: new Date(),
      updatedBy,
    };

    if (payload.name !== undefined) data.name = payload.name;
    if (payload.accountNo !== undefined) data.accountNo = payload.accountNo ?? null;
    if (payload.iban !== undefined) data.iban = payload.iban ?? null;
    if (payload.isActive !== undefined) data.isActive = payload.isActive;

    // Frontend’den "initialBalance" geliyor: onu Bank.openingBalance’a yaz
    if ((payload as any).initialBalance !== undefined) {
      const ib = (payload as any).initialBalance as number;
      data.openingBalance = ib !== 0 ? ib : null;
    }

    const updated = await prisma.bank.update({
      where: { id },
      data: data as any,
    });

    const deltaGroups = await prisma.transaction.groupBy({
      by: ['bankId'],
      _sum: { bankDelta: true },
      where: {
        deletedAt: null,
        bankId: updated.id,
        OR: [{ description: { not: OPENING_TX_DESC } }, { description: null }],
      },
    });

    const transactionDelta =
      deltaGroups.length > 0 ? toNumber(deltaGroups[0]._sum?.bankDelta) : 0;

    const openingBalance = toNumber((updated as any).openingBalance);
    const currentBalance = openingBalance + transactionDelta;

    return {
      ...(updated as any),
      openingBalance,
      currentBalance,
    };
  }

  async softDeleteBank(id: string, deletedBy: string): Promise<BankRecord> {
    const existing = await prisma.bank.findUnique({ where: { id } });
    if (!existing || (existing as any).deletedAt) {
      throw new Error('Bank not found.');
    }

    const deleted = await prisma.bank.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy,
      } as any,
    });

    return deleted as any;
  }

  async bulkSaveBanks(
    payload: Array<{
      id: string;
      name: string;
      accountNo: string | null;
      iban: string | null;
      openingBalance?: number;
      isActive?: boolean;
    }>,
    userId: string
  ): Promise<BankWithBalance[]> {
    const results: BankWithBalance[] = [];

    for (const item of payload) {
      const openingBalance = item.openingBalance ?? 0;
      const isNew = item.id.startsWith('tmp-');

      if (isNew) {
        const created = await prisma.bank.create({
          data: {
            name: item.name,
            accountNo: item.accountNo ?? null,
            iban: item.iban ?? null,
            openingBalance: openingBalance !== 0 ? openingBalance : null,
            isActive: item.isActive ?? true,
            createdBy: userId,
          } as any,
        });

        // new bank transactionDelta = 0 varsayılsa da legacy / dışarıdan eklenmiş olabilir
        const deltaGroups = await prisma.transaction.groupBy({
          by: ['bankId'],
          _sum: { bankDelta: true },
          where: {
            deletedAt: null,
            bankId: created.id,
            OR: [{ description: { not: OPENING_TX_DESC } }, { description: null }],
          },
        });

        const transactionDelta =
          deltaGroups.length > 0 ? toNumber(deltaGroups[0]._sum?.bankDelta) : 0;

        results.push({
          ...(created as any),
          openingBalance,
          currentBalance: openingBalance + transactionDelta,
        });

        continue;
      }

      // Update existing
      const existing = await prisma.bank.findUnique({ where: { id: item.id } });
      if (!existing || (existing as any).deletedAt) {
        continue;
      }

      const updated = await prisma.bank.update({
        where: { id: item.id },
        data: {
          name: item.name,
          accountNo: item.accountNo ?? null,
          iban: item.iban ?? null,
          openingBalance: openingBalance !== 0 ? openingBalance : null,
          isActive: item.isActive ?? true,
          updatedAt: new Date(),
          updatedBy: userId,
        } as any,
      });

      const deltaGroups = await prisma.transaction.groupBy({
        by: ['bankId'],
        _sum: { bankDelta: true },
        where: {
          deletedAt: null,
          bankId: updated.id,
          OR: [{ description: { not: OPENING_TX_DESC } }, { description: null }],
        },
      });

      const transactionDelta =
        deltaGroups.length > 0 ? toNumber(deltaGroups[0]._sum?.bankDelta) : 0;

      results.push({
        ...(updated as any),
        openingBalance,
        currentBalance: openingBalance + transactionDelta,
      });
    }

    return results;
  }
}
