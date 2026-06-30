import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { LOYALTY_TIERS, nextTierProgress } from "../../lib/loyalty";

export const LoyaltyService = {
  // The authenticated client's loyalty status: current tier, progress to the
  // next, and the full ladder (single source of truth for the UI).
  async getStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lifetimeSpend: true, loyaltyTier: true },
    });
    if (!user) throw new AppError("User not found", 404);

    const spend = Number(user.lifetimeSpend);
    const { current, next, remaining, progress } = nextTierProgress(spend);
    return {
      lifetimeSpend: spend,
      tier: current.name,
      discountPercent: current.discountPercent,
      next: next
        ? { name: next.name, minSpend: next.minSpend, discountPercent: next.discountPercent }
        : null,
      remaining,
      progress,
      tiers: LOYALTY_TIERS,
    };
  },
};
