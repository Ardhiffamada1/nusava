export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ProductStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentMethod = {
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  MANUAL_BANK_TRANSFER: 'MANUAL_BANK_TRANSFER',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const StockMovementReason = {
  INITIAL: 'INITIAL',
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  MANUAL_ADJUSTMENT: 'MANUAL_ADJUSTMENT',
  RESTOCK: 'RESTOCK',
} as const;
export type StockMovementReason = (typeof StockMovementReason)[keyof typeof StockMovementReason];
