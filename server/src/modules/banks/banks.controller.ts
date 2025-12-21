import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { BanksService } from './banks.service';
import { bankIdParamSchema, bulkSaveBankSchema, createBankSchema, deleteBankSchema, updateBankSchema } from './banks.validation';
import { getUserId, getUserInfo } from '../../config/auth';
import { logAudit, createDiff } from '../auditLog/auditLog.helper';

const service = new BanksService();

function handleError(res: Response, error: unknown) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Validation error', details: error.issues });
  }

  if (error instanceof Error) {
    return res.status(400).json({ message: error.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

export class BanksController {
  async list(_req: Request, res: Response) {
    try {
      const banks = await service.getAllBanksWithBalances();
      res.json(banks);
    } catch (error) {
      handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const payload = createBankSchema.parse(req.body);
      // İŞLEM LOGU (AUDIT LOG) - 8.1: Ayarlar modal değişiklikleri loglanır
      const { userId: createdBy, userEmail } = await getUserInfo(req);
      const bank = await service.createBank(payload, createdBy);
      
      await logAudit(
        userEmail,
        'CREATE',
        'BANK',
        `Banka oluşturuldu: ${bank.name}`,
        bank.id,
        { bank: { name: bank.name, accountNo: bank.accountNo, iban: bank.iban } }
      );
      
      res.status(201).json(bank);
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const params = bankIdParamSchema.parse(req.params);
      const payload = updateBankSchema.parse(req.body);
      // İŞLEM LOGU (AUDIT LOG) - 8.1: Ayarlar modal değişiklikleri loglanır
      const { userId: updatedBy, userEmail } = await getUserInfo(req);
      const existing = await service.getBankById(params.id);
      const bank = await service.updateBank(params.id, payload, updatedBy);
      
      if (existing) {
        await logAudit(
          userEmail,
          'UPDATE',
          'BANK',
          `Banka güncellendi: ${bank.name}`,
          bank.id,
          createDiff(existing, bank)
        );
      }
      
      res.json(bank);
    } catch (error) {
      handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const params = bankIdParamSchema.parse(req.params);
      deleteBankSchema.parse(req.body); // Validate but don't use payload
      // İŞLEM LOGU (AUDIT LOG) - 8.1: Ayarlar modal değişiklikleri loglanır
      const { userId: deletedBy, userEmail } = await getUserInfo(req);
      const existing = await service.getBankById(params.id);
      const bank = await service.softDeleteBank(params.id, deletedBy);
      
      if (existing) {
        await logAudit(
          userEmail,
          'DELETE',
          'BANK',
          `Banka silindi: ${existing.name}`,
          existing.id,
          { bank: { name: existing.name } }
        );
      }
      
      res.json(bank);
    } catch (error) {
      handleError(res, error);
    }
  }

  async bulkSave(req: Request, res: Response) {
    try {
      console.log('BanksController.bulkSave - received body:', JSON.stringify(req.body, null, 2));
      const rawPayload = bulkSaveBankSchema.parse(req.body);
      console.log('BanksController.bulkSave - parsed payload:', JSON.stringify(rawPayload, null, 2));
      // Normalize undefined to null for accountNo and iban
      const payload = rawPayload.map((item) => ({
        id: item.id,
        name: item.name,
        accountNo: item.accountNo ?? null,
        iban: item.iban ?? null,
        openingBalance: item.openingBalance ?? 0,
        isActive: item.isActive ?? true,
      }));
      console.log('BanksController.bulkSave - normalized payload:', JSON.stringify(payload, null, 2));
      // İŞLEM LOGU (AUDIT LOG) - 8.1: CSV importlar loglanır
      const { userId, userEmail } = await getUserInfo(req);
      console.log('BanksController.bulkSave - userId:', userId);
      const banks = await service.bulkSaveBanks(payload, userId);
      console.log('BanksController.bulkSave - saved banks:', JSON.stringify(banks, null, 2));
      
      await logAudit(
        userEmail,
        'IMPORT',
        'BANK',
        `${banks.length} banka CSV'den içe aktarıldı`,
        null,
        { count: banks.length, banks: banks.map(b => ({ id: b.id, name: b.name })) }
      );
      
      res.json(banks);
    } catch (error) {
      console.error('BanksController.bulkSave - error:', error);
      handleError(res, error);
    }
  }
}
