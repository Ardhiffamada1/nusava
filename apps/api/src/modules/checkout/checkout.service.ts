import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CheckoutDto,
  GuestCheckoutDto,
  OrderStatus,
  PaymentStatus,
  StockMovementReason,
} from '@commerceos/contracts';
import { Prisma } from '@commerceos/database';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(userId: string, dto: CheckoutDto) {
    return this.prisma.$transaction(
      async (tx) => {
        // 1. Fetch user's active cart with all line items
        const cart = await tx.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: true,
                    inventory: true,
                  },
                },
              },
            },
          },
        });

        if (!cart || cart.items.length === 0) {
          throw new BadRequestException('Your shopping cart is empty.');
        }

        // 2. Resolve Shipping Address
        let shippingAddressId = dto.shippingAddressId;
        if (!shippingAddressId && dto.newAddress) {
          const newAddr = await tx.address.create({
            data: {
              userId,
              fullName: dto.newAddress.fullName,
              phone: dto.newAddress.phone,
              streetAddress: dto.newAddress.streetAddress,
              city: dto.newAddress.city,
              state: dto.newAddress.state,
              postalCode: dto.newAddress.postalCode,
              country: dto.newAddress.country || 'US',
              isDefaultShipping: true,
            },
          });
          shippingAddressId = newAddr.id;
        }

        if (!shippingAddressId) {
          throw new BadRequestException('A valid shipping address must be selected or provided.');
        }

        // 3. Atomically check and deduct stock for each item, creating line item snapshots
        let subtotalNumber = 0;
        const orderItemInputs: Array<{
          variantId: string;
          productNameSnapshot: string;
          variantSkuSnapshot: string;
          variantAttributesSnapshot: Prisma.InputJsonValue;
          unitPriceSnapshot: Prisma.Decimal;
          quantity: number;
          lineTotal: Prisma.Decimal;
          inventoryId: string;
          previousStock: number;
          newStock: number;
        }> = [];

        for (const item of cart.items) {
          const variant = item.variant;

          // Acquire pessimistic row lock on inventory record to prevent concurrent race conditions
          const lockedRows = await tx.$queryRaw<Array<{ id: string; quantityOnHand: number; safetyStockLevel: number }>>`
            SELECT id, "quantityOnHand", "safetyStockLevel"
            FROM inventory
            WHERE "variantId" = ${variant.id}
            FOR UPDATE
          `;

          const inventory = lockedRows[0];

          if (!inventory) {
            throw new NotFoundException(`Inventory record not found for variant ${variant.sku}`);
          }

          if (inventory.quantityOnHand < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for '${variant.product.title} (${variant.title})'. Only ${inventory.quantityOnHand} available, requested ${item.quantity}.`,
            );
          }

          // Atomic deduction under exclusive lock
          const newStock = inventory.quantityOnHand - item.quantity;
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantityOnHand: newStock },
          });

          // Price calculation based strictly on server data
          const unitPrice = variant.priceOverride
            ? Number(variant.priceOverride)
            : Number(variant.product.basePrice);

          const lineTotal = unitPrice * item.quantity;
          subtotalNumber += lineTotal;

          orderItemInputs.push({
            variantId: variant.id,
            productNameSnapshot: variant.product.title,
            variantSkuSnapshot: variant.sku,
            variantAttributesSnapshot: variant.attributes as Prisma.InputJsonValue,
            unitPriceSnapshot: new Prisma.Decimal(unitPrice),
            quantity: item.quantity,
            lineTotal: new Prisma.Decimal(lineTotal),
            inventoryId: inventory.id,
            previousStock: inventory.quantityOnHand,
            newStock,
          });
        }

        // 4. Calculate Financial Totals
        // Free shipping on orders over $150
        const shippingCostNumber = subtotalNumber >= 150 ? 0.0 : 15.0;
        const taxTotalNumber = 0.0;
        const grandTotalNumber = subtotalNumber + shippingCostNumber + taxTotalNumber;

        // Generate Order Number: ORD-YYYYMMDD-XXXX
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

        // 5. Create Order
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            shippingAddressId,
            status: OrderStatus.CONFIRMED,
            subtotal: new Prisma.Decimal(subtotalNumber),
            shippingCost: new Prisma.Decimal(shippingCostNumber),
            taxTotal: new Prisma.Decimal(taxTotalNumber),
            grandTotal: new Prisma.Decimal(grandTotalNumber),
            currency: 'USD',
            notes: dto.notes || null,
            items: {
              create: orderItemInputs.map((it) => ({
                variantId: it.variantId,
                productNameSnapshot: it.productNameSnapshot,
                variantSkuSnapshot: it.variantSkuSnapshot,
                variantAttributesSnapshot: it.variantAttributesSnapshot,
                unitPriceSnapshot: it.unitPriceSnapshot,
                quantity: it.quantity,
                lineTotal: it.lineTotal,
              })),
            },
            payment: {
              create: {
                method: dto.paymentMethod,
                status: PaymentStatus.PENDING,
                amount: new Prisma.Decimal(grandTotalNumber),
              },
            },
          },
          include: {
            items: true,
            payment: true,
            shippingAddress: true,
          },
        });

        // 6. Record Stock Movements linked to this Order
        for (const it of orderItemInputs) {
          await tx.stockMovement.create({
            data: {
              inventoryId: it.inventoryId,
              orderId: order.id,
              actorId: userId,
              quantityDelta: -it.quantity,
              balanceAfter: it.newStock,
              reason: StockMovementReason.ORDER_PLACED,
              notes: `Order placed: ${order.orderNumber} (-${it.quantity} units)`,
            },
          });
        }

        // 7. Clear cart items
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        // 8. Create Audit Log
        await tx.auditLog.create({
          data: {
            userId,
            action: 'ORDER_PLACED',
            entityType: 'Order',
            entityId: order.id,
            metadata: {
              orderNumber: order.orderNumber,
              grandTotal: grandTotalNumber,
              itemsCount: orderItemInputs.length,
            },
          },
        });

        return order;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        timeout: 10000,
      },
    );
  }

  async guestCheckout(dto: GuestCheckoutDto) {
    return this.prisma.$transaction(
      async (tx) => {
        // 1. Resolve or create user account for guest
        let user = await tx.user.findUnique({
          where: { email: dto.email.toLowerCase() },
        });

        if (!user) {
          const parts = dto.fullName.trim().split(' ');
          const firstName = parts[0] || 'Tamu';
          const lastName = parts.slice(1).join(' ') || 'Nusantara';
          user = await tx.user.create({
            data: {
              email: dto.email.toLowerCase(),
              passwordHash: 'GUEST_NO_PASS_' + Math.random().toString(36),
              firstName,
              lastName,
              role: 'CUSTOMER',
            },
          });
        }

        // 2. Create shipping address for this order
        const address = await tx.address.create({
          data: {
            userId: user.id,
            fullName: dto.fullName,
            phone: dto.phone,
            streetAddress: dto.streetAddress,
            city: dto.city,
            state: dto.state,
            postalCode: dto.postalCode,
            country: dto.country || 'ID',
            isDefaultShipping: true,
          },
        });

        // 3. Atomically lock inventory and deduct for each item
        let subtotalNumber = 0;
        const orderItemInputs: Array<{
          variantId: string;
          productNameSnapshot: string;
          variantSkuSnapshot: string;
          variantAttributesSnapshot: Prisma.InputJsonValue;
          unitPriceSnapshot: Prisma.Decimal;
          quantity: number;
          lineTotal: Prisma.Decimal;
          inventoryId: string;
          previousStock: number;
          newStock: number;
        }> = [];

        for (const item of dto.items) {
          const lockedRows = await tx.$queryRaw<Array<{ id: string; quantityOnHand: number; safetyStockLevel: number }>>`
            SELECT id, "quantityOnHand", "safetyStockLevel"
            FROM inventory
            WHERE "variantId" = ${item.variantId}
            FOR UPDATE
          `;

          const inventory = lockedRows[0];
          if (!inventory) {
            throw new NotFoundException(`Inventory record not found for variant ${item.variantId}`);
          }

          if (inventory.quantityOnHand < item.quantity) {
            throw new BadRequestException(
              `Stok tidak mencukupi untuk item pesanan. Tersisa ${inventory.quantityOnHand}, diminta ${item.quantity}.`
            );
          }

          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          });

          if (!variant) {
            throw new NotFoundException(`Product variant not found: ${item.variantId}`);
          }

          const newStock = inventory.quantityOnHand - item.quantity;
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantityOnHand: newStock },
          });

          const unitPrice = variant.priceOverride
            ? Number(variant.priceOverride)
            : Number(variant.product.basePrice);

          const lineTotal = unitPrice * item.quantity;
          subtotalNumber += lineTotal;

          orderItemInputs.push({
            variantId: variant.id,
            productNameSnapshot: variant.product.title,
            variantSkuSnapshot: variant.sku,
            variantAttributesSnapshot: variant.attributes as Prisma.InputJsonValue,
            unitPriceSnapshot: new Prisma.Decimal(unitPrice),
            quantity: item.quantity,
            lineTotal: new Prisma.Decimal(lineTotal),
            inventoryId: inventory.id,
            previousStock: inventory.quantityOnHand,
            newStock,
          });
        }

        const shippingAmount = 15;
        const grandTotalNumber = subtotalNumber + shippingAmount;

        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: user.id,
            shippingAddressId: address.id,
            status: OrderStatus.CONFIRMED,
            subtotal: new Prisma.Decimal(subtotalNumber),
            shippingCost: new Prisma.Decimal(shippingAmount),
            taxTotal: new Prisma.Decimal(0),
            grandTotal: new Prisma.Decimal(grandTotalNumber),
            currency: 'USD',
            notes: dto.notes,
            items: {
              create: orderItemInputs.map((i) => ({
                variantId: i.variantId,
                productNameSnapshot: i.productNameSnapshot,
                variantSkuSnapshot: i.variantSkuSnapshot,
                variantAttributesSnapshot: i.variantAttributesSnapshot,
                unitPriceSnapshot: i.unitPriceSnapshot,
                quantity: i.quantity,
                lineTotal: i.lineTotal,
              })),
            },
            payment: {
              create: {
                method: dto.paymentMethod,
                status: PaymentStatus.PENDING,
                amount: new Prisma.Decimal(grandTotalNumber),
              },
            },
          },
          include: {
            items: true,
            shippingAddress: true,
            payment: true,
          },
        });

        // 6. Record immutable stock movements in ledger
        for (const item of orderItemInputs) {
          await tx.stockMovement.create({
            data: {
              inventoryId: item.inventoryId,
              orderId: order.id,
              actorId: user.id,
              reason: StockMovementReason.ORDER_PLACED,
              quantityDelta: -item.quantity,
              balanceAfter: item.newStock,
              notes: `Guest Checkout: Order ${order.orderNumber} placed by ${dto.fullName}`,
            },
          });
        }

        return order;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        timeout: 10000,
      },
    );
  }
}
