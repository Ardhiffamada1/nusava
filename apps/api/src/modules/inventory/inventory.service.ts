import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StockAdjustmentDto, StockMovementReason } from '@commerceos/contracts';
import { Prisma } from '@commerceos/database';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getInventory(options: {
    page?: number;
    limit?: number;
    search?: string;
    lowStockOnly?: boolean;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryWhereInput = {};

    if (options.search) {
      where.variant = {
        OR: [
          { sku: { contains: options.search, mode: 'insensitive' } },
          { title: { contains: options.search, mode: 'insensitive' } },
          { product: { title: { contains: options.search, mode: 'insensitive' } } },
        ],
      };
    }

    if (options.lowStockOnly) {
      // In PostgreSQL, quantityOnHand <= safetyStockLevel
      where.quantityOnHand = { lte: 5 };
    }

    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  category: { select: { name: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.inventory.count({ where }),
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

  async adjustStock(dto: StockAdjustmentDto, actorId?: string) {
    return this.prisma.$transaction(async (tx) => {
      // Lock and fetch current inventory
      const inventory = await tx.inventory.findUnique({
        where: { variantId: dto.variantId },
        include: { variant: { select: { title: true, sku: true } } },
      });

      if (!inventory) {
        throw new NotFoundException(`Inventory record for variant ${dto.variantId} not found`);
      }

      const newBalance = inventory.quantityOnHand + dto.quantityDelta;
      if (newBalance < 0) {
        throw new BadRequestException(
          `Adjustment of ${dto.quantityDelta} would cause negative stock. Current quantity on hand is ${inventory.quantityOnHand}.`,
        );
      }

      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: { quantityOnHand: newBalance },
      });

      const movement = await tx.stockMovement.create({
        data: {
          inventoryId: inventory.id,
          actorId: actorId || null,
          quantityDelta: dto.quantityDelta,
          balanceAfter: newBalance,
          reason: dto.reason || StockMovementReason.MANUAL_ADJUSTMENT,
          notes: dto.notes,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: actorId || null,
          action: 'STOCK_ADJUSTED',
          entityType: 'Inventory',
          entityId: inventory.id,
          metadata: {
            variantSku: inventory.variant.sku,
            delta: dto.quantityDelta,
            newBalance,
            notes: dto.notes,
          },
        },
      });

      return {
        inventory: updatedInventory,
        movement,
      };
    });
  }

  async getMovements(options: {
    variantId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.StockMovementWhereInput = {};
    if (options.variantId) {
      where.inventory = { variantId: options.variantId };
    }

    const [items, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          inventory: {
            include: {
              variant: {
                select: {
                  id: true,
                  sku: true,
                  title: true,
                  product: { select: { title: true, slug: true } },
                },
              },
            },
          },
          order: {
            select: { id: true, orderNumber: true },
          },
        },
      }),
      this.prisma.stockMovement.count({ where }),
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
