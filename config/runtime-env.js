// Runtime overrides for Tesla Helper.
// Populate window.APP_ENV with environment-specific overrides for production.
// This file is ignored by git so credentials can live outside of version control.
window.APP_ENV = {
  ...(window.APP_ENV || {}),
  teslaAuth: {
    clientId: '6b4c3799-fcf9-4ecf-af69-cfe999d774ca',
    clientSecret: '***REMOVED***',
    audience: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
    apiBase: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
    deviceCodeEndpoint: 'https://auth.tesla.com/oauth2/v3/device/code',
    tokenEndpoint: 'https://auth.tesla.com/oauth2/v3/token',
  },
};
