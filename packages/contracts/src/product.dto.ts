import { z } from 'zod';
import { ProductStatus } from './enums';

export const VariantInputSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1, 'SKU is required'),
  title: z.string().min(1, 'Variant title is required'),
  priceOverride: z.number().positive().optional().nullable(),
  attributes: z.record(z.string(), z.string()).default({}),
  barcode: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  initialStock: z.number().int().min(0).default(0),
});

export const ImageInputSchema = z.object({
  url: z.string().url('Invalid image URL'),
  altText: z.string().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isThumbnail: z.boolean().default(false),
});

export const CreateProductDtoSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric lowercase with dashes'),
  description: z.string().min(5, 'Description is required'),
  basePrice: z.number().positive('Base price must be greater than 0'),
  categoryId: z.string().uuid('Invalid category ID'),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  variants: z.array(VariantInputSchema).min(1, 'At least one variant or default SKU is required'),
  images: z.array(ImageInputSchema).default([]),
});

export type CreateProductDto = z.infer<typeof CreateProductDtoSchema>;

export const UpdateProductDtoSchema = CreateProductDtoSchema.partial();
export type UpdateProductDto = z.infer<typeof UpdateProductDtoSchema>;

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().optional(),
  origin: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'title']).default('newest'),
});

export type ProductQueryDto = z.infer<typeof ProductQuerySchema>;
