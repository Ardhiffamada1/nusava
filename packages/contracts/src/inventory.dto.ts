import { z } from 'zod';
import { StockMovementReason } from './enums';

export const StockAdjustmentDtoSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
  quantityDelta: z.number().int().refine(val => val !== 0, 'Quantity delta cannot be zero'),
  reason: z.nativeEnum(StockMovementReason).default(StockMovementReason.MANUAL_ADJUSTMENT),
  notes: z.string().min(3, 'A reason note is required for manual stock adjustments'),
});

export type StockAdjustmentDto = z.infer<typeof StockAdjustmentDtoSchema>;
