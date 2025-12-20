import { z } from 'zod';
import { createPosTerminalSchema, updatePosTerminalSchema, posTerminalIdParamSchema, bulkSavePosTerminalSchema } from './pos-terminals.validation';

export type CreatePosTerminalDTO = z.infer<typeof createPosTerminalSchema>;
export type UpdatePosTerminalDTO = z.infer<typeof updatePosTerminalSchema>;
export type PosTerminalIdParamDTO = z.infer<typeof posTerminalIdParamSchema>;
export type BulkSavePosTerminalDTO = z.infer<typeof bulkSavePosTerminalSchema>;

export interface PosTerminalRecord {
  id: string;
  bankId: string;
  name: string;
  commissionRate: number; // Decimal as number (0.0250 = 2.5%)
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date | null;
  updatedBy: string | null;
  deletedAt: Date | null;
  deletedBy: string | null;
}

