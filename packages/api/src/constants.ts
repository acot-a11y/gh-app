export const PORT = parseInt(process.env.PORT ?? '8080', 10);
export const SHUTDOWN_TIMEOUT = 10_000;
export const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID ?? '';
export const APP_TOKEN_KEY = process.env.APP_TOKEN_KEY ?? '';
export const GH_APP_LOGIN = 'acot-a11y[bot]';
export const GH_APP_ID = parseInt(process.env.GH_APP_ID ?? '0', 10);
export const GH_APP_CLIENT_ID = process.env.GH_APP_CLIENT_ID ?? '';
export const GH_APP_CLIENT_SECRET = process.env.GH_APP_CLIENT_SECRET ?? '';
export const GH_APP_REDIRECT_URI = process.env.GH_APP_REDIRECT_URI ?? '';

export const GH_APP_PEM = (() => {
  if (process.env.NODE_ENV === 'test') {
    return '';
  }

  const raw = process.env.GH_APP_PEM;
  if (raw == null) {
    throw new Error('.pem file (encoded) does not exists');
  }

  return Buffer.from(raw, 'base64').toString();
})();
