const DEFAULT_PROD_API = 'https://photopic-backend-git-main-arishkumars-projects.vercel.app';
const API_BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEFAULT_PROD_API : '')).replace(/\/+$/, '');

export function resolveMediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  return fetch(url, options);
}
