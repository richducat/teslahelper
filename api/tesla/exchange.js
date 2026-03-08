import {
  DEFAULT_TESLA_CONFIG,
  handleCors,
  normalizeCorsProxyUrl,
  normalizeTeslaUrl,
  parseTeslaResponse,
  resolveClientCredentials,
  resolvePayload,
  sendJson,
  trimAuthValue,
  withCorsProxy,
} from './_shared.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const payload = resolvePayload(req);
  const code = trimAuthValue(payload.code);
  const audience = trimAuthValue(payload.audience || process.env.TESLA_AUDIENCE || DEFAULT_TESLA_CONFIG.audience);
  const redirectUri = trimAuthValue(payload.redirectUri || process.env.TESLA_REDIRECT_URI || DEFAULT_TESLA_CONFIG.redirectUri);
  const corsProxyUrl = normalizeCorsProxyUrl(payload.corsProxyUrl || process.env.CORS_PROXY_URL || '');
  const tokenEndpoint = normalizeTeslaUrl(
    payload.tokenEndpoint || process.env.TESLA_TOKEN_ENDPOINT || DEFAULT_TESLA_CONFIG.tokenEndpoint,
    'token',
    DEFAULT_TESLA_CONFIG.tokenEndpoint
  );
  const { clientId, clientSecret } = resolveClientCredentials(payload);

  if (!code) {
    sendJson(res, 400, { error: 'Missing authorization code.' });
    return;
  }

  if (!clientId) {
    sendJson(res, 400, { error: 'Missing Tesla client ID.' });
    return;
  }

  if (!clientSecret) {
    sendJson(res, 400, {
      error: 'Missing Tesla client secret. Set TESLA_CLIENT_SECRET on the server or provide a compatibility fallback in runtime-env.js.',
    });
    return;
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    audience,
    redirect_uri: redirectUri,
  });

  try {
    const response = await fetch(withCorsProxy(tokenEndpoint, corsProxyUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const { payload: teslaPayload, message } = await parseTeslaResponse(response);

    if (!response.ok) {
      sendJson(res, response.status, { error: message || 'Token exchange failed.' });
      return;
    }

    sendJson(res, 200, teslaPayload || {});
  } catch (error) {
    sendJson(res, 500, { error: error?.message || 'Token exchange failed.' });
  }
}
