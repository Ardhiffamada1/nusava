import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '@commerceos/contracts';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const [
      totalProducts,
      totalOrders,
      ordersAggregate,
      lowStockCount,
      recentOrders,
      pendingOrdersCount,
      customersCount,
    ] = await Promise.all([
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { grandTotal: true },
        where: {
          status: { not: OrderStatus.CANCELLED },
          payment: { status: PaymentStatus.PAID },
        },
      }),
      this.prisma.inventory.count({
        where: { quantityOnHand: { lte: 5 } },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          payment: { select: { status: true, method: true } },
        },
      }),
      this.prisma.order.count({
        where: { status: OrderStatus.PENDING },
      }),
      this.prisma.user.count({
        where: { role: 'CUSTOMER' },
      }),
    ]);

    const totalRevenue = Number(ordersAggregate._sum.grandTotal || 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalProducts,
      lowStockCount,
      pendingOrdersCount,
      customersCount,
      recentOrders,
    };
  }

  async getSalesTrend(days = 14) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: sinceDate },
        status: { not: OrderStatus.CANCELLED },
      },
      select: {
        createdAt: true,
        grandTotal: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const dayMap = new Map<string, { date: string; revenue: number; orderCount: number }>();

    for (let i = 0; i <= days; i++) {
      const d = new Date(sinceDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, { date: key, revenue: 0, orderCount: 0 });
    }

    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      const existing = dayMap.get(key);
      if (existing) {
        existing.revenue += Number(order.grandTotal);
        existing.orderCount += 1;
      }
    }

    return Array.from(dayMap.values());
  }

  async exportCsv(type: 'orders' | 'inventory' | 'products'): Promise<string> {
    if (type === 'orders') {
      const orders = await this.prisma.order.findMany({
        include: { user: true, payment: true },
        orderBy: { createdAt: 'desc' },
      });

      const header = 'Order Number,Date,Customer Email,Status,Payment Method,Payment Status,Total\n';
      const rows = orders.map((o) =>
        `"${o.orderNumber}","${o.createdAt.toISOString()}","${o.user.email}","${o.status}","${o.payment?.method || ''}","${o.payment?.status || ''}","${o.grandTotal}"`,
      );
      return header + rows.join('\n');
    }

    if (type === 'inventory') {
      const inventory = await this.prisma.inventory.findMany({
        include: {
          variant: { include: { product: true } },
        },
        orderBy: { quantityOnHand: 'asc' },
      });

      const header = 'SKU,Product Title,Variant Title,Quantity On Hand,Safety Stock Level\n';
      const rows = inventory.map((i) =>
        `"${i.variant.sku}","${i.variant.product.title}","${i.variant.title}","${i.quantityOnHand}","${i.safetyStockLevel}"`,
      );
      return header + rows.join('\n');
    }

    // Products
    const products = await this.prisma.product.findMany({
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'ID,Title,Slug,Category,Base Price,Status,Variants Count\n';
    const rows = products.map((p) =>
      `"${p.id}","${p.title}","${p.slug}","${p.category.name}","${p.basePrice}","${p.status}","${p.variants.length}"`,
    );
    return header + rows.join('\n');
  }
}
