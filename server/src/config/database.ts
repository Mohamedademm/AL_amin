import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ENV } from './env';

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

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (ENV.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
