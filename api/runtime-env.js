import { DEFAULT_TESLA_CONFIG, trimAuthValue } from './tesla/_shared.js';

function escapeJsString(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'");
}

export default function handler(req, res) {
  const clientConfig = {
    clientId: trimAuthValue(process.env.TESLA_CLIENT_ID || process.env.NEXT_PUBLIC_TESLA_CLIENT_ID || ''),
    audience: trimAuthValue(process.env.TESLA_AUDIENCE || DEFAULT_TESLA_CONFIG.audience),
    apiBase: trimAuthValue(process.env.TESLA_API_BASE || DEFAULT_TESLA_CONFIG.apiBase),
    tokenEndpoint: trimAuthValue(process.env.TESLA_TOKEN_ENDPOINT || DEFAULT_TESLA_CONFIG.tokenEndpoint),
    redirectUri: trimAuthValue(process.env.TESLA_REDIRECT_URI || DEFAULT_TESLA_CONFIG.redirectUri),
    authorizeEndpoint: 'https://auth.tesla.com/oauth2/v3/authorize',
    backendOrigin: trimAuthValue(process.env.PUBLIC_BACKEND_ORIGIN || ''),
  };

  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(
    `window.APP_ENV = Object.assign({}, window.APP_ENV || {}, { teslaAuth: Object.assign({}, (window.APP_ENV && window.APP_ENV.teslaAuth) || {}, { clientId: '${escapeJsString(
      clientConfig.clientId
    )}', audience: '${escapeJsString(clientConfig.audience)}', apiBase: '${escapeJsString(
      clientConfig.apiBase
    )}', tokenEndpoint: '${escapeJsString(clientConfig.tokenEndpoint)}', redirectUri: '${escapeJsString(
      clientConfig.redirectUri
    )}', authorizeEndpoint: '${escapeJsString(clientConfig.authorizeEndpoint)}', backendOrigin: '${escapeJsString(
      clientConfig.backendOrigin
    )}' }) });`
  );
}
