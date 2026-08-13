import { corsHeaders } from './cors.ts';

export function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function requirePost(req: Request): Response | null {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }
  return null;
}

/** Prefer stable client messages over raw PostgREST / Auth errors. */
export function clientErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    const message = error.message.trim();
    // Keep short, non-internal messages; otherwise use fallback.
    if (message.length <= 160 && !message.includes('JWT') && !/at\s+\w+\./.test(message)) {
      return message;
    }
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim() && message.length <= 160) {
      return message.trim();
    }
  }
  return fallback;
}
