import {
  DEFAULT_TESLA_CONFIG,
  handleCors,
  normalizeTeslaUrl,
  parseTeslaResponse,
  resolvePayload,
  sendJson,
  trimAuthValue,
} from './_shared.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const payload = resolvePayload(req);
  const accessToken = trimAuthValue(payload.accessToken || payload.access_token);
  const apiBase = normalizeTeslaUrl(
    payload.apiBase || process.env.TESLA_API_BASE || DEFAULT_TESLA_CONFIG.apiBase,
    'api',
    DEFAULT_TESLA_CONFIG.apiBase
  );
  const selectedVin = trimAuthValue(payload.vin || '');

  if (!accessToken) {
    sendJson(res, 400, { error: 'Missing access token.' });
    return;
  }

  const headers = { Authorization: `Bearer ${accessToken}` };

  try {
    const listResponse = await fetch(`${apiBase}/api/1/vehicles`, {
      method: 'GET',
      headers,
    });

    const { payload: listPayload, message: listMessage } = await parseTeslaResponse(listResponse);

    if (!listResponse.ok) {
      sendJson(res, listResponse.status, { error: listMessage || 'Unable to reach Tesla Fleet API.' });
      return;
    }

    const vehicles = listPayload?.response || [];
    const vin = selectedVin || vehicles[0]?.vin;
    let vehicle = null;
    let vehicleError = '';

    if (vin) {
      const vehicleResponse = await fetch(`${apiBase}/api/1/vehicles/${encodeURIComponent(vin)}/vehicle_data`, {
        method: 'GET',
        headers,
      });

      const { payload: vehiclePayload, message: vehicleMessage } = await parseTeslaResponse(vehicleResponse);

      if (vehicleResponse.ok) {
        vehicle = vehiclePayload?.response || null;
      } else {
        vehicleError = vehicleMessage || 'Vehicle details unavailable.';
      }
    }

    sendJson(res, 200, {
      response: vehicles,
      vehicle,
      vehicleError,
    });
  } catch (error) {
    sendJson(res, 500, { error: error?.message || 'Unable to reach Tesla Fleet API.' });
  }
}
