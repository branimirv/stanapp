import { supabase } from '@/lib/supabase';
import type { Profile, ProfileUpdate } from '@/types/app.types';

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, values: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(values)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
