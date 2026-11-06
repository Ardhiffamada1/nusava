import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  OrderStatus,
  PaymentStatus,
  StockMovementReason,
  UserRole,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from '@commerceos/contracts';
import { Prisma } from '@commerceos/database';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrders(options: {
    userId?: string;
    role?: UserRole;
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    // Customers only see their own orders
    if (options.role === UserRole.CUSTOMER) {
      if (!options.userId) throw new ForbiddenException('User identification missing');
      where.userId = options.userId;
    } else if (options.userId && options.role !== UserRole.ADMIN) {
      where.userId = options.userId;
    }

    if (options.status) {
      where.status = options.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          shippingAddress: true,
          payment: true,
          _count: {
            select: { items: true },
          },
        },
      }),
      this.prisma.order.count({ where }),
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

  async getOrderById(orderId: string, userId: string, role: UserRole) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        shippingAddress: true,
        payment: true,
        items: true,
        stockMovements: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    if (role === UserRole.CUSTOMER && order.userId !== userId) {
      throw new ForbiddenException('You are not authorized to view this order');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, dto: UpdateOrderStatusDto, actorId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot change status of a cancelled order');
    }

    if (order.status === OrderStatus.DELIVERED && dto.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot modify status of an already delivered order');
    }

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: dto.status,
        notes: dto.notes ? `${order.notes ? order.notes + ' | ' : ''}${dto.notes}` : order.notes,
      },
      include: {
        items: true,
        payment: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actorId,
        action: 'ORDER_STATUS_UPDATED',
        entityType: 'Order',
        entityId: orderId,
        metadata: {
          previousStatus: order.status,
          newStatus: dto.status,
          notes: dto.notes,
        },
      },
    });

    return updated;
  }

  async cancelOrder(orderId: string, actorId: string, role: UserRole, reasonNotes?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          payment: true,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Authorization check
      if (role === UserRole.CUSTOMER && order.userId !== actorId) {
        throw new ForbiddenException('You cannot cancel this order');
      }

      // State check: cannot cancel if delivered or already cancelled
      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException('Order has already been cancelled');
      }

      if (order.status === OrderStatus.DELIVERED) {
        throw new BadRequestException('Delivered orders cannot be cancelled');
      }

      // Restock inventory for each order item exactly once
      for (const item of order.items) {
        if (item.variantId) {
          const inventory = await tx.inventory.findUnique({
            where: { variantId: item.variantId },
          });

          if (inventory) {
            const newStock = inventory.quantityOnHand + item.quantity;

            await tx.inventory.update({
              where: { id: inventory.id },
              data: { quantityOnHand: newStock },
            });

            await tx.stockMovement.create({
              data: {
                inventoryId: inventory.id,
                orderId: order.id,
                actorId,
                quantityDelta: item.quantity,
                balanceAfter: newStock,
                reason: StockMovementReason.ORDER_CANCELLED,
                notes: `Restock from cancellation of order ${order.orderNumber} (+${item.quantity} units)`,
              },
            });
          }
        }
      }

      // Handle payment status refund simulation if paid
      if (order.payment && order.payment.status === PaymentStatus.PAID) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: { status: PaymentStatus.REFUNDED },
        });
      }

      // Transition order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          notes: reasonNotes
            ? `${order.notes ? order.notes + ' | ' : ''}Cancellation reason: ${reasonNotes}`
            : order.notes,
        },
        include: {
          items: true,
          payment: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: actorId,
          action: 'ORDER_CANCELLED',
          entityType: 'Order',
          entityId: order.id,
          metadata: {
            orderNumber: order.orderNumber,
            reason: reasonNotes,
          },
        },
      });

      return updatedOrder;
    });
  }

  async updatePaymentStatus(orderId: string, dto: UpdatePaymentStatusDto, actorId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment record for order ${orderId} not found`);
    }

    const updatedPayment = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: dto.status,
        transactionReference: dto.transactionReference || payment.transactionReference,
        paidAt: dto.status === PaymentStatus.PAID ? new Date() : payment.paidAt,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actorId,
        action: 'PAYMENT_STATUS_UPDATED',
        entityType: 'Payment',
        entityId: payment.id,
        metadata: {
          orderNumber: payment.order.orderNumber,
          previousStatus: payment.status,
          newStatus: dto.status,
          reference: dto.transactionReference,
        },
      },
    });

    return updatedPayment;
  }
}
