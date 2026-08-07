import {
  expenseSchema,
  loginSchema,
  propertySchema,
  registerSchema,
  tenantFormSchema,
} from '@/utils/validators';

const uuid = '11111111-1111-4111-8111-111111111111';

describe('loginSchema', () => {
  it('accepts a valid login', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'password1' }).success).toBe(
      true,
    );
  });

  it('rejects short passwords and invalid emails', () => {
    expect(loginSchema.safeParse({ email: 'nope', password: 'password1' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'short' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('requires matching passwords', () => {
    const mismatch = registerSchema.safeParse({
      full_name: 'Ana Anić',
      email: 'a@b.com',
      password: 'password1',
      confirm_password: 'password2',
    });
    expect(mismatch.success).toBe(false);

    const match = registerSchema.safeParse({
      full_name: 'Ana Anić',
      email: 'a@b.com',
      password: 'password1',
      confirm_password: 'password1',
    });
    expect(match.success).toBe(true);
  });
});

describe('propertySchema', () => {
  const base = {
    type: 'apartment' as const,
    usage_status: 'vacant' as const,
    name: 'Stan 1',
    address: 'Ilica 1',
    rent_amount: 0,
  };

  it('accepts a vacant apartment', () => {
    expect(propertySchema.safeParse(base).success).toBe(true);
  });

  it('requires rent_amount > 0 when rented', () => {
    const rented = propertySchema.safeParse({
      ...base,
      usage_status: 'rented',
      rent_amount: 0,
    });
    expect(rented.success).toBe(false);
    if (!rented.success) {
      expect(rented.error.issues.some((issue) => issue.path.includes('rent_amount'))).toBe(true);
    }
  });
});

describe('tenantFormSchema', () => {
  it('requires at least two name parts', () => {
    expect(
      tenantFormSchema.safeParse({
        full_name: 'Ana',
        phone: '091',
        contract_start: '2024-01-01',
        deposit_amount: 0,
      }).success,
    ).toBe(false);

    expect(
      tenantFormSchema.safeParse({
        full_name: 'Ana Anić',
        phone: '091',
        contract_start: '2024-01-01',
        deposit_amount: 0,
      }).success,
    ).toBe(true);
  });
});

describe('expenseSchema', () => {
  it('requires positive amount and uuids', () => {
    expect(
      expenseSchema.safeParse({
        property_id: uuid,
        category_id: uuid,
        amount: 10,
        is_recurring: false,
        billing_date: '2024-01-01',
      }).success,
    ).toBe(true);

    expect(
      expenseSchema.safeParse({
        property_id: uuid,
        category_id: uuid,
        amount: 0,
        is_recurring: false,
        billing_date: '2024-01-01',
      }).success,
    ).toBe(false);
  });
});
