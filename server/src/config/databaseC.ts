import { PrismaClient } from '@prisma/client';

/**
 * Singleton instance of PrismaClient to be used across the application.
 * Prevents multiple connections from being opened during hot-reloads in development.
 */
const prisma = new PrismaClient();

export default prisma;
