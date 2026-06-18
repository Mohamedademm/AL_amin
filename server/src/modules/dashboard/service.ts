import prisma from '../../config/database';
import { OrderStatus } from '@prisma/client';

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
      prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: OrderStatus.ACCEPTED } }),
      prisma.inventory.count({ where: { quantity: { lt: LOW_STOCK_THRESHOLD } } }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    // Normalize the grouped counts into a flat, predictable object.
    const statusCounts: Record<string, number> = {
      PENDING: 0,
      VERIFYING: 0,
      ACCEPTED: 0,
      REFUSED: 0,
    };
    for (const row of ordersByStatus) statusCounts[row.status] = row._count._all;

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
};
