import prisma from '../../config/database';

interface AuditEntry {
  userId: string;
  action: string; // e.g. 'DISCOUNT_APPLIED', 'UPDATE_PRICE'
  entity: string; // e.g. 'Product', 'Discount'
  entityId: string;
  oldValue?: string;
  newValue?: string;
}

export const AuditService = {
  // Record a single administrative action for full traceability.
  async log(entry: AuditEntry) {
    return prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        oldValue: entry.oldValue ?? null,
        newValue: entry.newValue ?? null,
      },
    });
  },

  // Latest audit entries with the acting user attached (admin view).
  async listAll() {
    return prisma.auditLog.findMany({
      take: 100,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
  },
};
