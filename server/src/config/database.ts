import { PrismaClient } from "../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { ENV } from "./env";
import { getCurrentUserId } from "../lib/requestContext";

/**
 * Postgres driver adapter — supplies the connection string to Prisma 7
 * (the schema datasource has no inline `url`, so the adapter is required).
 */
const adapter = new PrismaPg({ connectionString: ENV.DATABASE_URL });

/**
 * Singleton PrismaClient reused across the app to avoid exhausting
 * connections during dev hot-reloads.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

// Models where every mutation gets an automatic audit trail.
const TRACKED_MODELS = new Set([
  "Product",
  "Category",
  "Order",
  "User",
  "VendingSpot",
  "Inventory",
  "Discount",
]);

// Attach an automatic audit-log middleware via $extends (Prisma 7 style).
// Runs AFTER each operation so auto-generated ids are available. The acting
// user comes from AsyncLocalStorage set by the auth middleware.
const audited = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const result = await query(args);

        if (!TRACKED_MODELS.has(model)) return result;
        if (model === "AuditLog") return result;
        if (!["create", "update", "delete"].includes(operation))
          return result;

        const userId = getCurrentUserId();
        if (!userId) return result;

        const action = operation.toUpperCase();
        let entityId = "";
        let oldValue: string | undefined;
        let newValue: string | undefined;

        switch (operation) {
          case "create": {
            entityId = (result as Record<string, unknown>)?.id as string ?? "";
            newValue = JSON.stringify(args.data);
            break;
          }
          case "update": {
            entityId = (args.where?.id as string) ?? "";
            newValue = JSON.stringify(args.data);
            break;
          }
          case "delete": {
            entityId = (result as Record<string, unknown>)?.id as string ?? "";
            oldValue = JSON.stringify(result);
            break;
          }
        }

        // Fire-and-forget — never let an audit write fail the operation.
        prisma.auditLog
          .create({
            data: {
              userId,
              action,
              entity: model,
              entityId,
              oldValue,
              newValue,
            },
          })
          .catch(() => {});

        return result;
      },
    },
  },
});

if (ENV.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma;

export default audited;
