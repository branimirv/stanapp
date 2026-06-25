import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { RentPayment, RentPaymentInsert, RentPaymentUpdate } from '@/types/app.types';

interface UseRentPaymentsOptions {
  propertyId?: string;
  tenantId?: string;
}

export function useRentPayments(options: UseRentPaymentsOptions = {}) {
  const { propertyId, tenantId } = options;
  const { user } = useAuthStore();
  const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setRentPayments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

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

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setRentPayments(data ?? []);
    }

    setIsLoading(false);
  }, [user, propertyId, tenantId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(async (values: RentPaymentInsert) => {
    const { data, error: err } = await supabase
      .from('rent_payments')
      .insert(values)
      .select()
      .single();

    if (err) throw err;

    setRentPayments((prev) => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (id: string, values: RentPaymentUpdate) => {
    const { data, error: err } = await supabase
      .from('rent_payments')
      .update(values)
      .eq('id', id)
      .select()
      .single();

    if (err) throw err;

    setRentPayments((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('rent_payments').delete().eq('id', id);

    if (err) throw err;

    setRentPayments((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const markAsPaid = useCallback(
    async (id: string) =>
      update(id, {
        status: 'paid',
        payment_date: formatDateOnly(new Date()),
      }),
    [update],
  );

  return { rentPayments, isLoading, error, refetch, create, update, remove, markAsPaid };
}

function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
