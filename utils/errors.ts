/** Normalize thrown values (Supabase Postgrest errors are plain objects). */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  if (typeof err === 'string' && err.trim()) return err;
  return fallback;
}

/** Re-throw service/query failures as real `Error` instances. */
export function throwQueryError(error: unknown, fallback = 'Request failed'): never {
  throw new Error(getErrorMessage(error, fallback));
}

/** Safe message for React Query `error` fields in hooks. */
export function queryErrorMessage(error: unknown): string | null {
  if (!error) return null;
  return getErrorMessage(error, 'Request failed');
}
