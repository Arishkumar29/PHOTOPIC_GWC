// Central API base URL — reads from env var in production, falls back to same origin in dev
const BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Resolves a relative /api path to an absolute URL when VITE_API_URL is set.
 * Usage: apiFetch('/api/events') or apiFetch(`/api/events/${id}`, { method: 'DELETE' })
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = BASE ? `${BASE}${path}` : path;
  return fetch(url, init);
}

export const API_BASE = BASE;
