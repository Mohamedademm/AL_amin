import prisma from "../../config/database";
import { OrderStatus } from "../../generated/prisma";

// Tuning knobs for the replenishment model. Centralised here (not inline) so the
// forecasting policy lives in one obvious, auditable place.
const WINDOW_DAYS = 30; // sales history used to estimate demand velocity
const LEAD_TIME_DAYS = 3; // supplier resupply time — stock must outlast this
const SAFETY_DAYS = 3; // extra buffer to absorb demand spikes
const COVER_DAYS = 30; // how many days of demand a reorder should cover
const WARNING_DAYS = 7; // stock lasting under this many days is a soft alert
const MAX_ROWS = 100; // cap the board so the payload stays small

// Order states that actually consumed boutique stock — the true demand signal.
const CONSUMED: OrderStatus[] = [
  OrderStatus.ACCEPTED,
  OrderStatus.SHIPPING,
  OrderStatus.DELIVERED,
];

export type RestockRisk = "CRITICAL" | "WARNING" | "HEALTHY" | "IDLE";

export interface RestockItem {
  productId: string;
  productName: string;
  spotId: string;
  spotName: string;
  isWarehouse: boolean;
  currentQuantity: number;
  velocityPerDay: number;
  daysToStockout: number | null;
  predictedStockoutDate: string | null;
  suggestedReorder: number;
  risk: RestockRisk;
}

// Sort weight so the most urgent rows float to the top of the board.
const RISK_RANK: Record<RestockRisk, number> = {
  CRITICAL: 0,
  WARNING: 1,
  IDLE: 2,
  HEALTHY: 3,
};

export const RestockService = {
  // Predict each boutique's stockout date from recent sales velocity and propose
  // a reorder quantity per product. `spotId` scopes the board to one boutique
  // (used to restrict a MANAGER to the spot they manage).
  async getForecast(spotId?: string | null) {
    const since = new Date();
    since.setDate(since.getDate() - WINDOW_DAYS);

    const [inventory, soldRows] = await Promise.all([
      prisma.inventory.findMany({
        where: spotId ? { spotId } : {},
        include: {
          product: { select: { name: true } },
          spot: { select: { name: true, isWarehouse: true } },
        },
      }),
      // Units sold per product/spot over the window. OrderItem carries no spotId,
      // so we pull the parent order's spot alongside each line and fold in JS —
      // one query instead of one-per-spot.
      prisma.orderItem.findMany({
        where: {
          order: {
            status: { in: CONSUMED },
            createdAt: { gte: since },
            ...(spotId ? { spotId } : {}),
          },
        },
        select: {
          productId: true,
          quantity: true,
          order: { select: { spotId: true } },
        },
      }),
    ]);

    // Fold the sold lines into a velocity lookup keyed by `productId:spotId`.
    const soldByKey = new Map<string, number>();
    for (const row of soldRows) {
      const key = `${row.productId}:${row.order.spotId}`;
      soldByKey.set(key, (soldByKey.get(key) ?? 0) + row.quantity);
    }

    const now = Date.now();
    const round2 = (n: number) => Math.round(n * 100) / 100;

    const items: RestockItem[] = inventory.map((inv) => {
      const sold = soldByKey.get(`${inv.productId}:${inv.spotId}`) ?? 0;
      const velocity = sold / WINDOW_DAYS;

      // No recent demand → nothing to predict or reorder; surface as IDLE.
      if (velocity <= 0) {
        return {
          productId: inv.productId,
          productName: inv.product.name,
          spotId: inv.spotId,
          spotName: inv.spot.name,
          isWarehouse: inv.spot.isWarehouse,
          currentQuantity: inv.quantity,
          velocityPerDay: 0,
          daysToStockout: null,
          predictedStockoutDate: null,
          suggestedReorder: 0,
          risk: "IDLE",
        };
      }

      const daysToStockout = Math.floor(inv.quantity / velocity);
      // Order-up-to level: cover the resupply gap + the target horizon + safety.
      const orderUpTo = Math.ceil(
        velocity * (COVER_DAYS + LEAD_TIME_DAYS + SAFETY_DAYS),
      );
      const suggestedReorder = Math.max(0, orderUpTo - inv.quantity);

      let risk: RestockRisk;
      if (inv.quantity === 0 || daysToStockout <= LEAD_TIME_DAYS)
        risk = "CRITICAL"; // will run dry before resupply can arrive
      else if (daysToStockout <= WARNING_DAYS) risk = "WARNING";
      else risk = "HEALTHY";

      return {
        productId: inv.productId,
        productName: inv.product.name,
        spotId: inv.spotId,
        spotName: inv.spot.name,
        isWarehouse: inv.spot.isWarehouse,
        currentQuantity: inv.quantity,
        velocityPerDay: round2(velocity),
        daysToStockout,
        predictedStockoutDate: new Date(
          now + daysToStockout * 86_400_000,
        ).toISOString(),
        suggestedReorder,
        risk,
      };
    });

    // Most urgent first: by risk, then soonest stockout, then biggest reorder.
    items.sort(
      (a, b) =>
        RISK_RANK[a.risk] - RISK_RANK[b.risk] ||
        (a.daysToStockout ?? Infinity) - (b.daysToStockout ?? Infinity) ||
        b.suggestedReorder - a.suggestedReorder,
    );

    const summary = { critical: 0, warning: 0, healthy: 0, idle: 0 };
    for (const it of items) {
      if (it.risk === "CRITICAL") summary.critical++;
      else if (it.risk === "WARNING") summary.warning++;
      else if (it.risk === "HEALTHY") summary.healthy++;
      else summary.idle++;
    }

    return {
      generatedAt: new Date().toISOString(),
      params: {
        windowDays: WINDOW_DAYS,
        coverDays: COVER_DAYS,
        leadTimeDays: LEAD_TIME_DAYS,
        safetyDays: SAFETY_DAYS,
      },
      summary,
      items: items.slice(0, MAX_ROWS),
    };
  },
};
