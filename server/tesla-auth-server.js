/**
 * Minimal Tesla auth + Fleet API proxy.
 *
 * This server handles OAuth code exchange and refresh on the server side,
 * stores tokens outside of the client, and proxies Fleet API requests so
 * access tokens never reach the browser.
 *
 * Run locally with:
 *   TESLA_CLIENT_SECRET=... NEXT_PUBLIC_TESLA_CLIENT_ID=... node server/tesla-auth-server.js
 */

const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

const TESLA_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_TESLA_CLIENT_ID || '',
  clientSecret: process.env.TESLA_CLIENT_SECRET || '',
  audience: process.env.TESLA_AUDIENCE || 'https://fleet-api.prd.na.vn.cloud.tesla.com',
  tokenEndpoint: process.env.TESLA_TOKEN_ENDPOINT || 'https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token',
  apiBase: process.env.TESLA_API_BASE || 'https://fleet-api.prd.na.vn.cloud.tesla.com',
  redirectUri: process.env.TESLA_REDIRECT_URI || 'https://teslahelper.app/auth/callback',
  refreshSafetyWindowMs: 60 * 1000,
};

const TOKENS_PATH = path.join(__dirname, '..', 'config', 'tesla-tokens.json');

let tokenStore = loadTokenStore();

function loadTokenStore() {
  if (process.env.TESLA_ACCESS_TOKEN && process.env.TESLA_REFRESH_TOKEN) {
    return {
      accessToken: process.env.TESLA_ACCESS_TOKEN,
      refreshToken: process.env.TESLA_REFRESH_TOKEN,
      expiresAt: Number(process.env.TESLA_TOKEN_EXPIRES_AT || 0),
    };
  }

  try {
    const raw = fs.readFileSync(TOKENS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { accessToken: '', refreshToken: '', expiresAt: 0 };
  }
}

function persistTokenStore(store) {
  tokenStore = store;
  try {
    fs.mkdirSync(path.dirname(TOKENS_PATH), { recursive: true });
    fs.writeFileSync(TOKENS_PATH, JSON.stringify(store, null, 2), { mode: 0o600 });
  } catch (err) {
    console.warn('TeslaHelper: unable to persist token store', err?.message);
  }

  if (store.accessToken) {
    process.env.TESLA_ACCESS_TOKEN = store.accessToken;
    process.env.TESLA_REFRESH_TOKEN = store.refreshToken;
    process.env.TESLA_TOKEN_EXPIRES_AT = String(store.expiresAt || 0);
  }
}

function respondJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

async function fetchTeslaToken(params) {
  if (!TESLA_CONFIG.clientId || !TESLA_CONFIG.clientSecret) {
    throw new Error('Tesla credentials are missing on the server.');
  }

  const body = new URLSearchParams(params);
  const response = await fetch(TESLA_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || 'Token endpoint rejected request');
  }
  return payload;
}

function buildStoreFromTokenPayload(payload, fallbackRefreshToken) {
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || fallbackRefreshToken || '',
    expiresAt: Date.now() + (payload.expires_in || 0) * 1000,
  };
}

async function exchangeCode(code) {
  const payload = await fetchTeslaToken({
    grant_type: 'authorization_code',
    client_id: TESLA_CONFIG.clientId,
    client_secret: TESLA_CONFIG.clientSecret,
    code,
    audience: TESLA_CONFIG.audience,
    redirect_uri: TESLA_CONFIG.redirectUri,
  });

  const store = buildStoreFromTokenPayload(payload);
  persistTokenStore(store);
  return store;
}

async function refreshAccessToken() {
  if (!tokenStore?.refreshToken) {
    throw new Error('No Tesla refresh token available on server. Reconnect.');
  }
  const payload = await fetchTeslaToken({
    grant_type: 'refresh_token',
    client_id: TESLA_CONFIG.clientId,
    refresh_token: tokenStore.refreshToken,
  });

  const store = buildStoreFromTokenPayload(payload, tokenStore.refreshToken);
  persistTokenStore(store);
  return store;
}

async function ensureAccessToken() {
  const now = Date.now();
  if (tokenStore?.accessToken && tokenStore.expiresAt - TESLA_CONFIG.refreshSafetyWindowMs > now) {
    return tokenStore.accessToken;
  }
  const refreshed = await refreshAccessToken();
  return refreshed.accessToken;
}

async function proxyFleetVehicles() {
  const token = await ensureAccessToken();
  const response = await fetch(`${TESLA_CONFIG.apiBase}/api/1/vehicles`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    // Try one refresh cycle, then retry once.
    const refreshed = await refreshAccessToken();
    const retry = await fetch(`${TESLA_CONFIG.apiBase}/api/1/vehicles`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${refreshed.accessToken}` },
    });
    return retry;
  }

  return response;
}

function handleOptions(req, res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end();
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'OPTIONS') return handleOptions(req, res);

  try {
    if (url.pathname === '/api/tesla/auth/exchange' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      if (!body.code) throw new Error('Missing authorization code');
      const store = await exchangeCode(body.code);
      return respondJson(res, 200, { status: 'connected', expiresAt: store.expiresAt });
    }

    if (url.pathname === '/api/tesla/auth/refresh' && req.method === 'POST') {
      const store = await refreshAccessToken();
      return respondJson(res, 200, { status: 'connected', expiresAt: store.expiresAt });
    }

    if (url.pathname === '/api/tesla/vehicles' && req.method === 'GET') {
      const response = await proxyFleetVehicles();
      const payload = await response.json();
      return respondJson(res, response.status, payload);
    }

    respondJson(res, 404, { error: 'Not found' });
  } catch (err) {
    respondJson(res, 500, { error: err?.message || 'Server error' });
  }
});

const PORT = process.env.PORT || 8788;
server.listen(PORT, () => {
  console.log(`TeslaHelper auth server running on :${PORT}`);
});
