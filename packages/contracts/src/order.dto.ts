import { z } from 'zod';
import { OrderStatus, PaymentStatus } from './enums';

export const UpdateOrderStatusDtoSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusDtoSchema>;

export const UpdatePaymentStatusDtoSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  transactionReference: z.string().optional(),
});

export type UpdatePaymentStatusDto = z.infer<typeof UpdatePaymentStatusDtoSchema>;
