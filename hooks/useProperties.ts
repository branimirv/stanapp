import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { usePropertyStore } from '@/stores/propertyStore';
import type { Property, PropertyInsert, PropertyUpdate } from '@/types/app.types';

export function useProperties() {
  const { user } = useAuthStore();
  const { setProperties, addProperty, updateProperty, removeProperty } = usePropertyStore();
  const [properties, setLocalProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setLocalProperties([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('properties')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      const next = data ?? [];
      setLocalProperties(next);
      setProperties(next);
    }

    setIsLoading(false);
  }, [user, setProperties]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(
    async (values: PropertyInsert) => {
      if (!user) throw new Error('Not authenticated');

      const payload: PropertyInsert = {
        ...values,
        user_id: values.user_id ?? user.id,
      };

      const { data, error: err } = await supabase
        .from('properties')
        .insert(payload)
        .select()
        .single();

      if (err) throw err;

      if (!data.is_archived) {
        setLocalProperties((prev) => [data, ...prev]);
        addProperty(data);
      }

      return data;
    },
    [user, addProperty],
  );

  const update = useCallback(
    async (id: string, values: PropertyUpdate) => {
      const { data, error: err } = await supabase
        .from('properties')
        .update(values)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;

      if (data.is_archived) {
        setLocalProperties((prev) => prev.filter((p) => p.id !== id));
        removeProperty(id);
      } else {
        setLocalProperties((prev) => prev.map((p) => (p.id === id ? data : p)));
        updateProperty(id, data);
      }

      return data;
    },
    [updateProperty, removeProperty],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error: err } = await supabase.from('properties').delete().eq('id', id);

      if (err) throw err;

      setLocalProperties((prev) => prev.filter((p) => p.id !== id));
      removeProperty(id);
    },
    [removeProperty],
  );

  return { properties, isLoading, error, refetch, create, update, remove };
}
