/**
 * KaavalAI KSP — Unified Catalyst API Configuration
 * Supports development fallback to local port 8000 and AppSail backend URL in production.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const getApiEndpoint = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
