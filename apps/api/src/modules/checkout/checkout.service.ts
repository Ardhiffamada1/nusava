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
        // 1. Resolve checkout items: from dto.items or from user's active database cart
        let rawItems: Array<{ variantId: string; quantity: number }> = [];

        if (dto.items && dto.items.length > 0) {
          rawItems = dto.items;
        } else {
          const cart = await tx.cart.findUnique({
            where: { userId },
            include: { items: true },
          });

          if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Keranjang belanja kamu masih kosong.');
          }
          rawItems = cart.items.map((it) => ({
            variantId: it.variantId,
            quantity: it.quantity,
          }));
        }

        if (rawItems.length === 0) {
          throw new BadRequestException('Keranjang belanja kamu masih kosong.');
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
              country: dto.newAddress.country || 'ID',
              isDefaultShipping: true,
            },
          });
          shippingAddressId = newAddr.id;
        }

        if (!shippingAddressId) {
          throw new BadRequestException('Alamat pengiriman wajib dipilih atau diisi.');
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

        for (const item of rawItems) {
          const lockedRows = await tx.$queryRaw<Array<{ id: string; quantityOnHand: number; safetyStockLevel: number }>>`
            SELECT id, "quantityOnHand", "safetyStockLevel"
            FROM inventory
            WHERE "variantId" = ${item.variantId}
            FOR UPDATE
          `;

          const inventory = lockedRows[0];
          if (!inventory) {
            throw new NotFoundException(`Data inventaris tidak ditemukan untuk varian: ${item.variantId}`);
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
            throw new NotFoundException(`Produk tidak ditemukan untuk varian ${item.variantId}`);
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

        // 4. Calculate Financial Totals in IDR Rupiah
        // Gratis ongkir untuk pembelian >= Rp 200.000, selain itu Rp 20.000
        const shippingCostNumber = subtotalNumber >= 200000 ? 0 : 20000;
        const taxTotalNumber = 0;
        const grandTotalNumber = subtotalNumber + shippingCostNumber + taxTotalNumber;

        // Generate Order Number: ORD-YYYYMMDD-XXXX
        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
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
            currency: 'IDR',
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
              notes: `Order placed: ${order.orderNumber} (-${it.quantity} unit)`,
            },
          });
        }

        // 7. Clear cart items if user has an active cart in database
        const userCart = await tx.cart.findUnique({ where: { userId } });
        if (userCart) {
          await tx.cartItem.deleteMany({
            where: { cartId: userCart.id },
          });
        }

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
              paymentMethod: dto.paymentMethod,
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
            throw new NotFoundException(`Data inventaris tidak ditemukan untuk varian: ${item.variantId}`);
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
            throw new NotFoundException(`Produk tidak ditemukan untuk varian: ${item.variantId}`);
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

        // 4. Calculate Financial Totals in IDR Rupiah
        const shippingAmount = subtotalNumber >= 200000 ? 0 : 20000;
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
            currency: 'IDR',
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

        // 5. Stock Movements
        for (const it of orderItemInputs) {
          await tx.stockMovement.create({
            data: {
              inventoryId: it.inventoryId,
              orderId: order.id,
              actorId: user.id,
              quantityDelta: -it.quantity,
              balanceAfter: it.newStock,
              reason: StockMovementReason.ORDER_PLACED,
              notes: `Guest order: ${order.orderNumber} (-${it.quantity} unit)`,
            },
          });
        }

        // 6. Audit Log
        await tx.auditLog.create({
          data: {
            userId: user.id,
            action: 'GUEST_ORDER_PLACED',
            entityType: 'Order',
            entityId: order.id,
            metadata: {
              orderNumber: order.orderNumber,
              email: dto.email,
              grandTotal: grandTotalNumber,
              paymentMethod: dto.paymentMethod,
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
}
