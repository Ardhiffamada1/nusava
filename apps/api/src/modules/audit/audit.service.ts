import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@commerceos/database';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async getLogs(options: {
    page?: number;
    limit?: number;
    entityType?: string;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 25));
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};
    if (options.entityType) {
      where.entityType = options.entityType;
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
