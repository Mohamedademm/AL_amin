import { AsyncLocalStorage } from "async_hooks";

// Holds the current user's ID for the duration of one HTTP request.
// The Prisma audit middleware reads this to associate audit entries.
export const ctx = new AsyncLocalStorage<{ userId: string }>();

export const getCurrentUserId = (): string | undefined =>
  ctx.getStore()?.userId;
