# Tesla Fleet API integration guide

This project uses Tesla's Fleet API to fetch live vehicle telemetry after a customer signs in with their Tesla account. Use this guide to configure developer access and wire credentials into the app so we can log and pull data for customers.

## 1) Set up Tesla developer access
1. Sign in at [developer.tesla.com](https://developer.tesla.com) and create a Fleet API project.
2. Create or join the correct organization so the app is owned by your company (not a personal account).
3. Generate an OAuth client for the Fleet API with the **device flow** enabled (matches the UI flow in `main.js`).
4. Record the client ID and client secret, and set the callback URLs/allowed origins to include the domain you will host this app on.
5. For Fleet tokens, use the fleet auth host (for NA: `https://fleet-auth.prd.na.vn.cloud.tesla.com/oauth2/v3/token`). Using the global auth token endpoint will prevent the app from exchanging the device code for customer access tokens.

## 2) Request the right scopes and audience
The app expects the following defaults defined in `main.js`:
- Scope: `openid offline_access vehicle_device_data vehicle_cmds`
- Audience: `https://fleet-api.prd.na.vn.cloud.tesla.com`

If your Tesla client uses a different region, update the audience, token, and API base URLs accordingly.

## 3) Wire credentials into the app
1. Copy `config/runtime-env.example.js` to `config/runtime-env.js` (ignored by git).
2. Replace the placeholders with your Tesla client values:
   - `clientId` and `clientSecret` from the developer portal
   - `audience`, `apiBase`, `deviceCodeEndpoint`, and `tokenEndpoint` that match the region for your fleet account (use the fleet auth host, not `auth-global`, for tokens)
3. Deploy the site with `config/runtime-env.js` served before `main.js` so `window.APP_ENV.teslaAuth` overrides the defaults and keeps the token endpoint aligned with the Fleet API region.

## 4) Verify device login and token refresh
The UI initiates the Tesla device login flow and polls the token endpoint until the user approves access. Token refresh happens automatically with a safety window to avoid expiry during API calls. To validate:
1. From the landing page, choose **Sign in with Tesla** and follow the verification URL with the provided user code.
2. Confirm that vehicle data appears under "Live from Tesla Fleet API." The app fetches `/api/1/vehicles` using the bearer token stored in localStorage.
3. After the initial token expires, ensure refresh succeeds without forcing the user to sign in again.

## 5) Logging and observability
- The app stores authentication state in `localStorage` under `teslahelper.teslaAuth` (see `main.js`).
- To capture customer telemetry for analytics or support, extend the telemetry normalization in `normalizeTelemetryFromFleet` (inside `main.js`) to emit the fields your backend expects and forward them to your logging endpoint after each successful fetch.
- Handle 401 responses by attempting a refresh (already implemented) and clear local storage if refresh fails to keep sessions clean.

## 6) Operational tips
- Use separate Tesla OAuth clients for staging and production and point each environment's `runtime-env.js` at the correct endpoints.
- Limit stored scope to only what you need; removing `vehicle_cmds` disables remote commands if you only need read-only data.
- Rotate client secrets periodically and redeploy the updated `runtime-env.js` values.
- If the Fleet API returns rate-limit or availability errors, the UI surfaces a friendly error string; consider adding retry/backoff logic around the fetch calls in `main.js` if your deployment needs more resilience.
