import { supabase } from '@/lib/supabase';
import type { Tenant, TenantInsert, TenantUpdate } from '@/types/app.types';

export async function fetchTenants(propertyId?: string): Promise<Tenant[]> {
  let query = supabase.from('tenants').select('*').order('created_at', { ascending: false });

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchTenant(id: string): Promise<Tenant> {
  const { data, error } = await supabase.from('tenants').select('*').eq('id', id).single();

  if (error) throw error;
  return data;
}

export async function createTenant(values: TenantInsert): Promise<Tenant> {
  const { data, error } = await supabase.from('tenants').insert(values).select().single();

  if (error) throw error;
  return data;
}

export async function updateTenant(id: string, values: TenantUpdate): Promise<Tenant> {
  const { data, error } = await supabase
    .from('tenants')
    .update(values)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTenant(id: string): Promise<void> {
  const { error } = await supabase.from('tenants').delete().eq('id', id);
  if (error) throw error;
}
