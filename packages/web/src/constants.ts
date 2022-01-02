export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:8080/';

export const GH_APP_CLIENT_ID =
  (import.meta.env.VITE_GH_APP_CLIENT_ID as string | undefined) ?? '';

export const GH_APP_REDIRECT_URI =
  (import.meta.env.VITE_GH_APP_REDIRECT_URI as string | undefined) ?? '';
