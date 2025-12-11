const DEFAULT_CONFIG = {
  audience: 'https://fleet-api.prd.vn.cloud.tesla.com',
  tokenEndpoint: 'https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token',
  redirectUri: 'https://teslahelper.app/auth/callback',
};

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const payload = req.method === 'POST' ? req.body || {} : req.query || {};
  const { code, audience, redirectUri } = payload;
  const clientId = process.env.NEXT_PUBLIC_TESLA_CLIENT_ID || process.env.TESLA_CLIENT_ID || 'ownerapi';
  const clientSecret = process.env.TESLA_CLIENT_SECRET;
  const tokenEndpoint = process.env.TESLA_TOKEN_ENDPOINT || DEFAULT_CONFIG.tokenEndpoint;

  if (!code) {
    res.status(400).json({ error: 'Missing authorization code.' });
    return;
  }

  if (!clientSecret) {
    res.status(400).json({ error: 'Server is missing TESLA_CLIENT_SECRET.' });
    return;
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code,
    audience: audience || DEFAULT_CONFIG.audience,
    redirect_uri: redirectUri || DEFAULT_CONFIG.redirectUri,
  });

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const payload = await response.json();

    if (!response.ok) {
      res.status(response.status).json({
        error: payload.error_description || payload.error || 'Token exchange failed.',
      });
      return;
    }

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Token exchange failed.' });
  }
}
