import { supabase } from '@/lib/supabase';
import type { Property, PropertyInsert, PropertyUpdate } from '@/types/app.types';
import { throwQueryError } from '@/utils/errors';

export async function fetchProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) throwQueryError(error);
  return data ?? [];
}

export async function fetchProperty(id: string): Promise<Property> {
  const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();

  if (error) throwQueryError(error);
  return data;
}

export async function createProperty(values: PropertyInsert): Promise<Property> {
  const { data, error } = await supabase.from('properties').insert(values).select().single();

  if (error) throwQueryError(error);
  return data;
}

export async function updateProperty(id: string, values: PropertyUpdate): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .update(values)
    .eq('id', id)
    .select()
    .single();

  if (error) throwQueryError(error);
  return data;
}

export async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) throwQueryError(error);
}
