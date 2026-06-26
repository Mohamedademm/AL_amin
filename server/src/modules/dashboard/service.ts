import prisma from "../../config/database";
import { OrderStatus } from "@prisma/client";

// Threshold below which a stock record is flagged as "low".
const LOW_STOCK_THRESHOLD = 10;

export const DashboardService = {
  // Aggregate the headline metrics shown on the staff/admin dashboards.
  async getStats() {
    const [
      productCount,
      categoryCount,
      spotCount,
      userCount,
      ordersByStatus,
      acceptedAgg,
      lowStock,
      recentOrders,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.vendingSpot.count(),
      prisma.user.count(),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: {
            in: [
              OrderStatus.ACCEPTED,
              OrderStatus.SHIPPING,
              OrderStatus.DELIVERED,
            ],
          },
        },
      }),
      prisma.inventory.count({
        where: { quantity: { lt: LOW_STOCK_THRESHOLD } },
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { client: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    // Normalize the grouped counts into a flat, predictable object.
    const statusCounts: Record<string, number> = {
      PENDING: 0,
      VERIFYING: 0,
      ACCEPTED: 0,
      SHIPPING: 0,
      DELIVERED: 0,
      REFUSED: 0,
    };
    for (const row of ordersByStatus)
      statusCounts[row.status] = row._count._all;

    const totalOrders = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    return {
      products: productCount,
      categories: categoryCount,
      spots: spotCount,
      users: userCount,
      orders: { total: totalOrders, ...statusCounts },
      revenue: acceptedAgg._sum.totalAmount ?? 0,
      lowStock,
      recentOrders,
    };
  },

  // Daily orders + accepted revenue for the last `days` days (for charts).
  async getTrends(days = 14) {
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, totalAmount: true, status: true },
    });

    // Pre-fill one bucket per day so the series has no gaps.
    const buckets = Array.from({ length: days }, (_, i) => {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      return { date: d.toISOString().slice(0, 10), orders: 0, revenue: 0 };
    });
    const byDate = new Map(buckets.map((b) => [b.date, b]));

    for (const o of orders) {
      const bucket = byDate.get(o.createdAt.toISOString().slice(0, 10));
      if (!bucket) continue;
      bucket.orders += 1;
      if (o.status === "ACCEPTED") bucket.revenue += Number(o.totalAmount);
    }

    return buckets;
  },
};
