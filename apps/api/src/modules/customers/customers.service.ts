import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@commerceos/database';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomers(options: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: 'CUSTOMER',
    };

    if (options.search) {
      where.OR = [
        { email: { contains: options.search, mode: 'insensitive' } },
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
          orders: {
            where: { status: { not: 'CANCELLED' } },
            select: { grandTotal: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const formattedCustomers = users.map((u) => {
      const totalSpent = u.orders.reduce((acc, o) => acc + Number(o.grandTotal), 0);
      return {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        ordersCount: u._count.orders,
        totalSpent,
        createdAt: u.createdAt,
      };
    });

    return {
      items: formattedCustomers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { payment: true, items: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Customer #${id} not found`);
    }

    const totalSpent = user.orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((acc, o) => acc + Number(o.grandTotal), 0);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      addresses: user.addresses,
      orders: user.orders,
      totalSpent,
      createdAt: user.createdAt,
    };
  }
}
