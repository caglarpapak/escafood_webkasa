import { AuditLogService, AuditAction, AuditEntityType } from './auditLog.service';

const auditLogService = new AuditLogService();

/**
 * İŞLEM LOGU (AUDIT LOG) - 8: Helper function to create audit log entries
 * This function should be called after any CREATE, UPDATE, DELETE, or IMPORT operation
 */
export async function logAudit(
  actorEmail: string,
  action: AuditAction,
  entityType: AuditEntityType,
  summary: string,
  entityId?: string | null,
  diff?: any | null
): Promise<void> {
  try {
    await auditLogService.createAuditLog({
      actorEmail,
      action,
      entityType,
      entityId: entityId ?? null,
      summary,
      diff: diff ?? null,
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main operation
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Helper to create diff object for UPDATE operations
 */
export function createDiff(before: any, after: any): any {
  const diff: any = {};
  const allKeys = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);

  for (const key of allKeys) {
    const beforeVal = before?.[key];
    const afterVal = after?.[key];

    if (JSON.stringify(beforeVal) !== JSON.stringify(afterVal)) {
      diff[key] = {
        before: beforeVal,
        after: afterVal,
      };
    }
  }

  return Object.keys(diff).length > 0 ? diff : null;
}

