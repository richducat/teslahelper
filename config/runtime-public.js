// Public runtime settings that are safe to ship with the static site.
// Secrets stay on the backend (Vercel env vars).
window.APP_ENV = {
  ...(window.APP_ENV || {}),
  teslaAuth: {
    ...((window.APP_ENV && window.APP_ENV.teslaAuth) || {}),
    clientId: '6b4c3799-fcf9-4ecf-af69-cfe999df9727',
    audience: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
    apiBase: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
    authorizeEndpoint: 'https://auth.tesla.com/oauth2/v3/authorize',
    tokenEndpoint: 'https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token',
    redirectUri: 'https://teslahelper.app/auth/callback',
    backendOrigin: 'https://teslahelper.vercel.app',
  },
};
