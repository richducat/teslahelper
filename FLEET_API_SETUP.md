# Tesla Fleet API integration guide

This project now uses Tesla's OAuth authorization-code flow and same-origin `/api/tesla/*` routes for token exchange, refresh, and vehicle fetches.

## 1) Create a Tesla OAuth client
1. Sign in at [developer.tesla.com](https://developer.tesla.com) and create or open your Fleet API project.
2. Create an OAuth client for the domain where this app will run.
3. Add the callback URL `https://your-domain.com/auth/callback`.
4. Add your site origin wherever Tesla asks for allowed origins or app URLs.
5. Save the Tesla client ID and client secret.

## 2) Configure this app
1. Copy `config/runtime-env.example.js` to `config/runtime-env.js`.
2. Set:
   - `clientId`
   - `audience` and `apiBase` for your region
   - `redirectUri` to your real callback URL
3. Prefer setting `TESLA_CLIENT_SECRET` in your deployment/serverless environment.
4. If you are using the included static runtime config only, `clientSecret` in `runtime-env.js` is still accepted as a compatibility fallback, but server-side env vars are safer.

## 3) Default endpoints used by the app
- Authorize endpoint: `https://auth.tesla.com/oauth2/v3/authorize`
- Token endpoint: `https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token`
- North America audience/API base: `https://fleet-api.prd.na.vn.cloud.tesla.com`

These defaults match Tesla's current Fleet API docs as of March 8, 2026. If your Tesla project uses another region, override `audience` and `apiBase` in `runtime-env.js`.

## 4) Scopes requested by the app
- `openid`
- `offline_access`
- `user_data`
- `vehicle_device_data`
- `vehicle_cmds`
- `vehicle_charging_cmds`

Trim these down if you only need read-only telemetry.

## 5) Verify the flow
1. Open the homepage and choose `Sign in with Tesla`.
2. Complete the Tesla-hosted sign-in and consent flow.
3. Confirm the callback lands on `/#my-tesla`.
4. Use `Refresh vehicle data` and verify live data replaces the demo dashboard.
5. Wait for the access token to get close to expiry, then refresh again and confirm the session stays alive without another login.

## 6) Runtime notes
- Tokens are stored in `localStorage` under `teslahelper.teslaAuth`.
- The callback page exchanges the code through `/api/tesla/exchange`.
- Vehicle fetches go through `/api/tesla/vehicles`.
- Refreshes go through `/api/tesla/refresh`.
