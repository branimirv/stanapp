import { z } from 'zod';
import { LANGUAGES, PROPERTY_TYPES, SUPPORTED_CURRENCIES, USAGE_STATUSES } from '@/constants/config';

export const propertySchema = z
  .object({
    type: z.enum(PROPERTY_TYPES),
    usage_status: z.enum(USAGE_STATUSES),
    parent_property_id: z.string().uuid().optional().nullable(),
    name: z.string().min(1, 'validation.required').max(100),
    address: z.string().min(1, 'validation.required').max(255),
    floor: z.number().int().optional().nullable(),
    area_sqm: z.number().positive().optional().nullable(),
    rent_amount: z.number().min(0),
    notes: z.string().max(1000).optional().nullable(),
  })
  .refine(
    (data) => data.type !== 'garage' || !data.parent_property_id || data.type === 'garage',
    { message: 'validation.garageParentInvalid', path: ['parent_property_id'] },
  )
  .refine(
    (data) => data.usage_status !== 'rented' || data.rent_amount > 0,
    { message: 'validation.rentRequired', path: ['rent_amount'] },
  );

export const tenantSchema = z.object({
  first_name: z.string().min(1, 'validation.required').max(100),
  last_name: z.string().min(1, 'validation.required').max(100),
  email: z.string().email('validation.invalidEmail').optional().or(z.literal('')),
  phone: z.string().max(20).optional().nullable(),
  contract_start: z.string().min(1, 'validation.required'),
  contract_end: z.string().optional().nullable(),
  deposit_amount: z.number().min(0),
  notes: z.string().max(1000).optional().nullable(),
});

export const expenseSchema = z.object({
  property_id: z.string().uuid('validation.required'),
  category_id: z.string().uuid('validation.required'),
  amount: z.number().positive('validation.positiveAmount'),
  is_recurring: z.boolean(),
  billing_date: z.string().min(1, 'validation.required'),
  due_date: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const rentPaymentSchema = z.object({
  property_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  amount: z.number().positive(),
  period_month: z.number().int().min(1).max(12),
  period_year: z.number().int().min(2000).max(2100),
  status: z.enum(['pending', 'paid', 'late', 'partial']),
  payment_date: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const profileSchema = z.object({
  full_name: z.string().min(1, 'validation.required').max(100),
  default_currency: z.enum(SUPPORTED_CURRENCIES),
  language: z.enum(LANGUAGES),
  theme: z.enum(['light', 'dark', 'system']),
});

export const loginSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
  password: z.string().min(8, 'validation.minLength'),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(1, 'validation.required'),
    email: z.string().email('validation.invalidEmail'),
    password: z.string().min(8, 'validation.minLength'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'validation.passwordsMatch',
    path: ['confirm_password'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
export type TenantFormValues = z.infer<typeof tenantSchema>;
export type ExpenseFormValues = z.infer<typeof expenseSchema>;
export type RentPaymentFormValues = z.infer<typeof rentPaymentSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
