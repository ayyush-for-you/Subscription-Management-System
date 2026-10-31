export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const SUBSCRIPTION_STATUS = {
  DRAFT: 'DRAFT',
  QUOTATION: 'QUOTATION',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
} as const;

export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];

export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const;

export type InvoiceStatus = typeof INVOICE_STATUS[keyof typeof INVOICE_STATUS];

export const PLAN_FREQUENCY = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const;

export type PlanFrequency = typeof PLAN_FREQUENCY[keyof typeof PLAN_FREQUENCY];

export const DISCOUNT_TYPE = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED',
} as const;

export type DiscountType = typeof DISCOUNT_TYPE[keyof typeof DISCOUNT_TYPE];

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  companyName?: string | null;
}

