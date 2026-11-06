import { z } from 'zod';

export const AddToCartDtoSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type AddToCartDto = z.infer<typeof AddToCartDtoSchema>;

export const UpdateCartItemDtoSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type UpdateCartItemDto = z.infer<typeof UpdateCartItemDtoSchema>;
