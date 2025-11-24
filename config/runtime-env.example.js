// Copy this file to config/runtime-env.js and replace the placeholder values
// with your Tesla developer credentials. The runtime file is ignored by git
// so secrets stay out of version control.
window.APP_ENV = {
  ...(window.APP_ENV || {}),
  teslaAuth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    audience: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
    apiBase: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
    deviceCodeEndpoint: 'https://auth-global.tesla.com/oauth2/v3/device/code',
    tokenEndpoint: 'https://fleet-auth.prd.na.vn.cloud.tesla.com/oauth2/v3/token'
  }
};
