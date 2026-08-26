// Central API helper connecting Frontend to Backend
const BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Resolves media / image URLs so relative paths like /bulk_photo or /api/drive-proxy
 * are routed to the backend in production
 */
export function resolveMediaUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://') || pathOrUrl.startsWith('data:')) {
    return pathOrUrl;
  }
  return BASE ? `${BASE}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}` : pathOrUrl;
}

/**
 * Perform fetch directly to the backend API.
 * In development, Vite proxies /api to http://localhost:3000.
 * In production, requests go to VITE_API_URL (e.g. Render/Railway).
 */
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = BASE ? `${BASE}${path}` : path;
  
  try {
    const res = await fetch(url, init);
    return res;
  } catch (err: any) {
    console.error(`[API Error] Failed to reach backend at ${url}:`, err);
    throw new Error(
      `Cannot connect to backend server at ${BASE || 'localhost:3000'}. Please ensure the backend is running.`
    );
  }
}

/**
 * Check if the real backend server is running and healthy
 */
export async function checkBackendHealth(): Promise<{ ok: boolean; info?: any }> {
  try {
    const res = await apiFetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      return { ok: true, info: data };
    }
  } catch (e) {
    // offline
  }
  return { ok: false };
}

export const API_BASE = BASE;
