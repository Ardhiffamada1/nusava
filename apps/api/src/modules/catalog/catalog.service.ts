import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  ProductStatus,
  StockMovementReason,
} from '@commerceos/contracts';
import { Prisma } from '@commerceos/database';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= CATEGORIES =================
  async getCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: true,
        parent: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category '${slug}' not found`);
    }

    return category;
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: string;
    displayOrder?: number;
  }) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictException(`Category slug '${data.slug}' already exists`);
    }

    return this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId,
        displayOrder: data.displayOrder ?? 0,
      },
    });
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      parentId?: string;
      displayOrder?: number;
      isActive?: boolean;
    },
  ) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (data.slug && data.slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({ where: { slug: data.slug } });
      if (existing) throw new ConflictException(`Category slug '${data.slug}' already exists`);
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  // ================= PRODUCTS =================
  async getProducts(query: ProductQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 12));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (query.status) {
      where.status = query.status;
    } else {
      where.status = ProductStatus.ACTIVE;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      const searchTerms = query.search.trim().split(/\s+/).filter(Boolean);
      if (searchTerms.length > 0) {
        where.AND = searchTerms.map((term) => ({
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { category: { name: { contains: term, mode: 'insensitive' } } },
            { category: { slug: { contains: term, mode: 'insensitive' } } },
            { variants: { some: { title: { contains: term, mode: 'insensitive' } } } },
            { variants: { some: { sku: { contains: term, mode: 'insensitive' } } } },
          ],
        }));
      }
    }

    if (query.origin) {
      const originTerm = query.origin.trim();
      const originCondition = {
        OR: [
          { title: { contains: originTerm, mode: 'insensitive' as const } },
          { description: { contains: originTerm, mode: 'insensitive' as const } },
        ],
      };
      if (Array.isArray(where.AND)) {
        where.AND.push(originCondition);
      } else if (where.AND) {
        where.AND = [where.AND as any, originCondition];
      } else {
        where.AND = [originCondition];
      }
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {};
      if (query.minPrice !== undefined) {
        where.basePrice.gte = new Prisma.Decimal(query.minPrice);
      }
      if (query.maxPrice !== undefined) {
        where.basePrice.lte = new Prisma.Decimal(query.maxPrice);
      }
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'price_asc') {
      orderBy = { basePrice: 'asc' };
    } else if (query.sortBy === 'price_desc') {
      orderBy = { basePrice: 'desc' };
    } else if (query.sortBy === 'title') {
      orderBy = { title: 'asc' };
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: [{ isThumbnail: 'desc' }, { displayOrder: 'asc' }],
          },
          variants: {
            where: { isActive: true },
            include: {
              inventory: {
                select: {
                  quantityOnHand: true,
                  reservedQuantity: true,
                  safetyStockLevel: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
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

  async searchSuggest(rawQuery: string) {
    if (!rawQuery || rawQuery.trim().length === 0) return [];
    const searchTerms = rawQuery.trim().split(/\s+/).filter(Boolean);
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
      AND: searchTerms.map((term) => ({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { category: { name: { contains: term, mode: 'insensitive' } } },
          { variants: { some: { title: { contains: term, mode: 'insensitive' } } } },
          { variants: { some: { sku: { contains: term, mode: 'insensitive' } } } },
        ],
      })),
    };

    return this.prisma.product.findMany({
      where,
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        basePrice: true,
        category: {
          select: { name: true, slug: true },
        },
        images: {
          orderBy: [{ isThumbnail: 'desc' }, { displayOrder: 'asc' }],
          take: 1,
          select: { url: true },
        },
      },
    });
  }

  async getProductBySlugOrId(identifier: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    const product = await this.prisma.product.findFirst({
      where: isUuid ? { OR: [{ id: identifier }, { slug: identifier }] } : { slug: identifier },
      include: {
        category: true,
        images: {
          orderBy: [{ isThumbnail: 'desc' }, { displayOrder: 'asc' }],
        },
        variants: {
          include: {
            inventory: {
              select: {
                quantityOnHand: true,
                reservedQuantity: true,
                safetyStockLevel: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product '${identifier}' not found`);
    }

    return product;
  }

  async createProduct(dto: CreateProductDto, actorId?: string) {
    const existing = await this.prisma.product.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Product slug '${dto.slug}' already exists`);
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new BadRequestException('Selected category does not exist');
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          title: dto.title,
          slug: dto.slug,
          description: dto.description,
          basePrice: new Prisma.Decimal(dto.basePrice),
          categoryId: dto.categoryId,
          status: dto.status || ProductStatus.ACTIVE,
          images: {
            create: dto.images.map((img, idx) => ({
              url: img.url,
              altText: img.altText || dto.title,
              displayOrder: img.displayOrder ?? idx,
              isThumbnail: img.isThumbnail ?? idx === 0,
            })),
          },
        },
      });

      for (const v of dto.variants) {
        const variant = await tx.productVariant.create({
          data: {
            productId: product.id,
            sku: v.sku,
            title: v.title,
            priceOverride: v.priceOverride ? new Prisma.Decimal(v.priceOverride) : null,
            attributes: v.attributes,
            barcode: v.barcode,
            isActive: v.isActive ?? true,
            inventory: {
              create: {
                quantityOnHand: v.initialStock || 0,
                reservedQuantity: 0,
                safetyStockLevel: 5,
              },
            },
          },
          include: { inventory: true },
        });

        if (v.initialStock && v.initialStock > 0 && variant.inventory) {
          await tx.stockMovement.create({
            data: {
              inventoryId: variant.inventory.id,
              actorId: actorId || null,
              quantityDelta: v.initialStock,
              balanceAfter: v.initialStock,
              reason: StockMovementReason.INITIAL,
              notes: 'Initial variant creation balance',
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: actorId || null,
          action: 'PRODUCT_CREATED',
          entityType: 'Product',
          entityId: product.id,
          metadata: { title: product.title, slug: product.slug },
        },
      });

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          variants: { include: { inventory: true } },
          images: true,
          category: true,
        },
      });
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto, actorId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.slug && dto.slug !== product.slug) {
      const existing = await this.prisma.product.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) throw new ConflictException(`Slug '${dto.slug}' is already taken`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          title: dto.title,
          slug: dto.slug,
          description: dto.description,
          basePrice: dto.basePrice !== undefined ? new Prisma.Decimal(dto.basePrice) : undefined,
          categoryId: dto.categoryId,
          status: dto.status,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: actorId || null,
          action: 'PRODUCT_UPDATED',
          entityType: 'Product',
          entityId: product.id,
          metadata: { title: updated.title },
        },
      });

      return tx.product.findUnique({
        where: { id },
        include: {
          variants: { include: { inventory: true } },
          images: true,
          category: true,
        },
      });
    });
  }

  async archiveProduct(id: string, actorId?: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    const updated = await this.prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: actorId || null,
        action: 'PRODUCT_ARCHIVED',
        entityType: 'Product',
        entityId: id,
      },
    });

    return updated;
  }
}
