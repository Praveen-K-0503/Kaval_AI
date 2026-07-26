/**
 * KaavalAI KSP — Unified Catalyst API Configuration
 * Supports development fallback to local port 8000 and AppSail backend URL in production.
 */
export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return 'https://kaavalai-production-api-50044342834.development.catalystserverless.in';
  }
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

export const getApiEndpoint = (path: string): string => {
  const baseUrl = typeof window !== 'undefined' ? getApiBaseUrl() : API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
