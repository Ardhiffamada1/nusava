import { z } from 'zod';
import { PaymentMethod } from './enums';

export const AddressDtoSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  streetAddress: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State or province is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country code is required').default('US'),
});

export type AddressDto = z.infer<typeof AddressDtoSchema>;

export const CheckoutDtoSchema = z.object({
  shippingAddressId: z.string().uuid().optional(),
  newAddress: AddressDtoSchema.optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().max(500).optional(),
}).refine(data => data.shippingAddressId || data.newAddress, {
  message: 'Either an existing address ID or new address details must be provided',
  path: ['shippingAddressId'],
});

export type CheckoutDto = z.infer<typeof CheckoutDtoSchema>;
