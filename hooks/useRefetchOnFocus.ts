import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

export function useRefetchOnFocus(refetch: () => void | Promise<void>) {
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );
}
