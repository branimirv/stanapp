import { supabase } from '@/lib/supabase';
import type { PropertyStatusHistory } from '@/types/app.types';
import { throwQueryError } from '@/utils/errors';

export async function fetchPropertyStatusHistory(
  propertyId: string,
): Promise<PropertyStatusHistory[]> {
  const { data, error } = await supabase
    .from('property_status_history')
    .select('*')
    .eq('property_id', propertyId)
    .order('started_at', { ascending: false });

  if (error) throwQueryError(error);
  return data ?? [];
}
