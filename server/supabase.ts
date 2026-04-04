// Supabase has been replaced by direct PostgreSQL (see server/db.ts).
// This file is kept as a no-op shim so any remaining import references
// compile without error until they are fully removed.

export function isServerSupabaseConfigured(): boolean {
  return false;
}

export function unwrapSupabaseResult<T>(data: T, _error: unknown, _context: string): T {
  return data;
}
