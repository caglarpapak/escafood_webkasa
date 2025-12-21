import { prisma } from '../../config/prisma';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT';
export type AuditEntityType =
  | 'TRANSACTION'
  | 'BANK'
  | 'CUSTOMER'
  | 'SUPPLIER'
  | 'POS_TERMINAL'
  | 'CREDIT_CARD'
  | 'LOAN'
  | 'CHEQUE';

export interface CreateAuditLogDto {
  actorEmail: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  summary: string;
  diff?: any | null;
}

export interface AuditLogDto {
  id: string;
  actorEmail: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string | null;
  summary: string;
  diff: any | null;
  createdAt: string;
}

export class AuditLogService {
  /**
   * İŞLEM LOGU (AUDIT LOG) - 8: Tüm değişikliklerin loglanması
   * Create an audit log entry
   */
  async createAuditLog(data: CreateAuditLogDto): Promise<AuditLogDto> {
    const log = await prisma.auditLog.create({
      data: {
        actorEmail: data.actorEmail,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId ?? null,
        summary: data.summary,
        diff: data.diff ?? null,
      },
    });

    return {
      id: log.id,
      actorEmail: log.actorEmail,
      action: log.action as AuditAction,
      entityType: log.entityType as AuditEntityType,
      entityId: log.entityId,
      summary: log.summary,
      diff: log.diff as any,
      createdAt: log.createdAt.toISOString(),
    };
  }

  /**
   * List audit logs with filters
   */
  async listAuditLogs(query: {
    from?: string;
    to?: string;
    actorEmail?: string;
    action?: AuditAction;
    entityType?: AuditEntityType;
    entityId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: AuditLogDto[]; totalCount: number }> {
    const where: any = {};

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) {
        where.createdAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.createdAt.lte = new Date(query.to);
      }
    }

    if (query.actorEmail) {
      where.actorEmail = query.actorEmail;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.entityType) {
      where.entityType = query.entityType;
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    const [items, totalCount] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit ?? 100,
        skip: query.offset ?? 0,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      items: items.map((log) => ({
        id: log.id,
        actorEmail: log.actorEmail,
        action: log.action as AuditAction,
        entityType: log.entityType as AuditEntityType,
        entityId: log.entityId,
        summary: log.summary,
        diff: log.diff as any,
        createdAt: log.createdAt.toISOString(),
      })),
      totalCount,
    };
  }
}

