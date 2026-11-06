import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from '@commerceos/contracts';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCart(userId?: string, guestSessionId?: string) {
    if (!userId && !guestSessionId) {
      throw new BadRequestException('Session identifier required to access cart');
    }

    if (userId) {
      let cart = await this.prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { where: { isThumbnail: true }, take: 1 },
                    },
                  },
                  inventory: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      include: {
                        images: { where: { isThumbnail: true }, take: 1 },
                      },
                    },
                    inventory: true,
                  },
                },
              },
            },
          },
        });
      }
      return cart;
    } else {
      let cart = await this.prisma.cart.findUnique({
        where: { guestSessionId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: { where: { isThumbnail: true }, take: 1 },
                    },
                  },
                  inventory: true,
                },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: { guestSessionId },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: {
                      include: {
                        images: { where: { isThumbnail: true }, take: 1 },
                      },
                    },
                    inventory: true,
                  },
                },
              },
            },
          },
        });
      }
      return cart;
    }
  }

  async getCart(userId?: string, guestSessionId?: string) {
    const cart = await this.getOrCreateCart(userId, guestSessionId);

    let subtotal = 0;
    const formattedItems = cart.items.map((item) => {
      const price = item.variant.priceOverride
        ? Number(item.variant.priceOverride)
        : Number(item.variant.product.basePrice);

      const lineTotal = price * item.quantity;
      subtotal += lineTotal;

      const availableStock = item.variant.inventory?.quantityOnHand || 0;
      const isAvailable = availableStock >= item.quantity;

      return {
        id: item.id,
        variantId: item.variantId,
        productId: item.variant.productId,
        productTitle: item.variant.product.title,
        productSlug: item.variant.product.slug,
        variantTitle: item.variant.title,
        sku: item.variant.sku,
        attributes: item.variant.attributes,
        unitPrice: price,
        quantity: item.quantity,
        lineTotal,
        availableStock,
        isAvailable,
        imageUrl: item.variant.product.images[0]?.url || null,
      };
    });

    return {
      id: cart.id,
      items: formattedItems,
      itemCount: formattedItems.reduce((acc, it) => acc + it.quantity, 0),
      subtotal,
    };
  }

  async addItem(dto: AddToCartDto, userId?: string, guestSessionId?: string) {
    // 1. Verify variant exists and has sufficient stock
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: { inventory: true, product: true },
    });

    if (!variant || !variant.isActive || variant.product.status !== 'ACTIVE') {
      throw new NotFoundException('Selected product variant is unavailable');
    }

    const availableStock = variant.inventory?.quantityOnHand || 0;
    if (availableStock <= 0) {
      throw new BadRequestException(`'${variant.title}' is currently out of stock`);
    }

    const cart = await this.getOrCreateCart(userId, guestSessionId);

    // 2. Check if already in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: dto.variantId,
        },
      },
    });

    const newQuantity = (existingItem?.quantity || 0) + dto.quantity;
    if (newQuantity > availableStock) {
      throw new BadRequestException(
        `Cannot add ${dto.quantity} more. Only ${availableStock} units available in stock.`,
      );
    }

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: dto.variantId,
          quantity: dto.quantity,
        },
      });
    }

    return this.getCart(userId, guestSessionId);
  }

  async updateItem(cartItemId: string, dto: UpdateCartItemDto, userId?: string, guestSessionId?: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        variant: { include: { inventory: true } },
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // Verify ownership
    if (userId && item.cart.userId !== userId) {
      throw new BadRequestException('Unauthorized cart modification');
    }
    if (!userId && guestSessionId && item.cart.guestSessionId !== guestSessionId) {
      throw new BadRequestException('Unauthorized cart modification');
    }

    const availableStock = item.variant.inventory?.quantityOnHand || 0;
    if (dto.quantity > availableStock) {
      throw new BadRequestException(
        `Cannot set quantity to ${dto.quantity}. Only ${availableStock} units available.`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId, guestSessionId);
  }

  async removeItem(cartItemId: string, userId?: string, guestSessionId?: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (userId && item.cart.userId !== userId) {
      throw new BadRequestException('Unauthorized cart modification');
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getCart(userId, guestSessionId);
  }

  async validateCart(userId?: string, guestSessionId?: string) {
    const cart = await this.getCart(userId, guestSessionId);

    const issues: {
      cartItemId: string;
      productTitle: string;
      sku: string;
      requested: number;
      available: number;
      message: string;
    }[] = [];

    for (const item of cart.items) {
      if (!item.isAvailable) {
        issues.push({
          cartItemId: item.id,
          productTitle: item.productTitle,
          sku: item.sku,
          requested: item.quantity,
          available: item.availableStock,
          message: item.availableStock === 0
            ? `'${item.productTitle} (${item.variantTitle})' is now out of stock.`
            : `Only ${item.availableStock} units remaining for '${item.productTitle}'.`,
        });
      }
    }

    return {
      isValid: issues.length === 0,
      cart,
      issues,
    };
  }
}
