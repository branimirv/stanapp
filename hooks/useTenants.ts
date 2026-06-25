import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Tenant, TenantInsert, TenantUpdate } from '@/types/app.types';

interface UseTenantsOptions {
  propertyId?: string;
}

export function useTenants(options: UseTenantsOptions = {}) {
  const { propertyId } = options;
  const { user } = useAuthStore();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setTenants([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let query = supabase.from('tenants').select('*').order('created_at', { ascending: false });

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setTenants(data ?? []);
    }

    setIsLoading(false);
  }, [user, propertyId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(async (values: TenantInsert) => {
    const { data, error: err } = await supabase
      .from('tenants')
      .insert(values)
      .select()
      .single();

    if (err) throw err;

    setTenants((prev) => [data, ...prev]);
    return data;
  }, []);

  const update = useCallback(async (id: string, values: TenantUpdate) => {
    const { data, error: err } = await supabase
      .from('tenants')
      .update(values)
      .eq('id', id)
      .select()
      .single();

    if (err) throw err;

    setTenants((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('tenants').delete().eq('id', id);

    if (err) throw err;

    setTenants((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tenants, isLoading, error, refetch, create, update, remove };
}
