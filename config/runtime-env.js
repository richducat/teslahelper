// Runtime overrides for Tesla Helper.
// Populate window.APP_ENV with environment-specific overrides for production.
// This file is ignored by git so credentials can live outside of version control.
window.APP_ENV = {
  ...(window.APP_ENV || {}),
  teslaAuth: {
    // Provide deploy-time credentials outside of the repo.
    clientId: '',
    clientSecret: '',
    audience: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
    apiBase: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
    deviceCodeEndpoint: 'https://auth-global.tesla.com/oauth2/v3/device/code',
    tokenEndpoint: 'https://fleet-auth.prd.na.vn.cloud.tesla.com/oauth2/v3/token',
  },
};
