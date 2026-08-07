import { supabase } from '@/lib/supabase';
import type {
  RentPayment,
  RentPaymentInsert,
  RentPaymentUpdate,
} from '@/types/app.types';
import type { RentPaymentListFilters } from '@/lib/queryKeys';
import { throwQueryError } from '@/utils/errors';

export async function fetchRentPayments(
  filters: RentPaymentListFilters = {},
): Promise<RentPayment[]> {
  const { propertyId, tenantId } = filters;

  let query = supabase
    .from('rent_payments')
    .select('*')
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false });

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  if (tenantId) {
    query = query.eq('tenant_id', tenantId);
  }

  const { data, error } = await query;
  if (error) throwQueryError(error);
  return data ?? [];
}

export async function fetchRentPayment(id: string): Promise<RentPayment> {
  const { data, error } = await supabase.from('rent_payments').select('*').eq('id', id).single();

  if (error) throwQueryError(error);
  return data;
}

export async function createRentPayment(values: RentPaymentInsert): Promise<RentPayment> {
  const { data, error } = await supabase.from('rent_payments').insert(values).select().single();

  if (error) throwQueryError(error);
  return data;
}

export async function updateRentPayment(
  id: string,
  values: RentPaymentUpdate,
): Promise<RentPayment> {
  const { data, error } = await supabase
    .from('rent_payments')
    .update(values)
    .eq('id', id)
    .select()
    .single();

  if (error) throwQueryError(error);
  return data;
}

export async function deleteRentPayment(id: string): Promise<void> {
  const { error } = await supabase.from('rent_payments').delete().eq('id', id);
  if (error) throwQueryError(error);
}
