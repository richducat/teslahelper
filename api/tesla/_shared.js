export const DEFAULT_TESLA_CONFIG = {
  audience: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
  apiBase: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
  tokenEndpoint: 'https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token',
  redirectUri: 'https://teslahelper.app/auth/callback',
};

const ALLOWED_TESLA_HOST_PATTERNS = {
  api: [/^fleet-api\.prd\.[a-z]+\.vn\.cloud\.tesla\.com$/],
  token: [/^fleet-auth\.prd(?:\.[a-z]+)?\.vn\.cloud\.tesla\.com$/],
};

export function trimAuthValue(value) {
  return typeof value === 'string' ? value.trim() : value;
}

export function resolvePayload(req) {
  if (!req) return {};
  const raw = req.method === 'POST' ? req.body ?? {} : req.query ?? {};
  if (typeof raw !== 'string') return raw;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

export function sendJson(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(payload);
}

export function setCorsHeaders(req, res) {
  const origin = trimAuthValue(req?.headers?.origin || '');
  const allowedOrigins = new Set([
    'https://teslahelper.app',
    'https://www.teslahelper.app',
    'https://teslahelper.vercel.app',
    'http://127.0.0.1:4821',
    'http://localhost:4821',
  ]);

  const extraOrigins = String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => trimAuthValue(value))
    .filter(Boolean);

  extraOrigins.forEach((value) => allowedOrigins.add(value));

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handleCors(req, res) {
  setCorsHeaders(req, res);
  if (req?.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function resolveClientCredentials(payload = {}) {
  return {
    clientId: trimAuthValue(process.env.TESLA_CLIENT_ID || process.env.NEXT_PUBLIC_TESLA_CLIENT_ID || payload.clientId || ''),
    clientSecret: trimAuthValue(process.env.TESLA_CLIENT_SECRET || payload.clientSecret || ''),
  };
}

export function normalizeTeslaUrl(value, kind, fallback) {
  const candidate = trimAuthValue(value) || fallback;

  try {
    const parsed = new URL(candidate);
    const allowed = ALLOWED_TESLA_HOST_PATTERNS[kind] || [];
    if (parsed.protocol !== 'https:') return fallback;
    if (!allowed.some((pattern) => pattern.test(parsed.hostname))) return fallback;
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString();
  } catch (error) {
    return fallback;
  }
}

export async function parseTeslaResponse(response) {
  const text = await response.text();

  if (!text) {
    return { payload: null, message: '' };
  }

  try {
    const payload = JSON.parse(text);
    const message = payload?.error_description || payload?.error || '';
    return { payload, message };
  } catch (error) {
    return { payload: null, message: text };
  }
}
