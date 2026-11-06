import { z } from 'zod';
import { PaymentMethod } from './enums';

export const AddressDtoSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  streetAddress: z.string().min(3, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State or province is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country code is required').default('ID'),
});

export type AddressDto = z.infer<typeof AddressDtoSchema>;

export const GuestCheckoutItemSchema = z.object({
  variantId: z.string().uuid('Invalid variant ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type GuestCheckoutItem = z.infer<typeof GuestCheckoutItemSchema>;

export const CheckoutDtoSchema = z
  .object({
    shippingAddressId: z.string().uuid().optional(),
    newAddress: AddressDtoSchema.optional(),
    paymentMethod: z.nativeEnum(PaymentMethod),
    notes: z.string().max(500).optional(),
    items: z.array(GuestCheckoutItemSchema).optional(),
  })
  .refine((data) => data.shippingAddressId || data.newAddress, {
    message: 'Either an existing address ID or new address details must be provided',
    path: ['shippingAddressId'],
  });

export type CheckoutDto = z.infer<typeof CheckoutDtoSchema>;

export const GuestCheckoutDtoSchema = z.object({
  email: z.string().email('Email tidak valid'),
  fullName: z.string().min(2, 'Nama lengkap wajib diisi'),
  phone: z.string().min(6, 'Nomor telepon/WA wajib diisi'),
  streetAddress: z.string().min(3, 'Alamat lengkap wajib diisi'),
  city: z.string().min(2, 'Kota/Kabupaten wajib diisi'),
  state: z.string().min(2, 'Provinsi wajib diisi'),
  postalCode: z.string().min(2, 'Kode pos wajib diisi'),
  country: z.string().default('ID'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().max(500).optional(),
  items: z.array(GuestCheckoutItemSchema).min(1, 'Keranjang belanja tidak boleh kosong'),
});

export type GuestCheckoutDto = z.infer<typeof GuestCheckoutDtoSchema>;
