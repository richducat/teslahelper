// Copy this file to config/runtime-env.js and replace the placeholder values
// with your Tesla developer credentials. The runtime file is ignored by git
// so secrets stay out of version control.
window.APP_ENV = {
  ...(window.APP_ENV || {}),
  teslaAuth: {
    clientId: 'your-tesla-client-id',
    // Prefer TESLA_CLIENT_SECRET as a server environment variable.
    // This client-side fallback exists only for compatibility with static deployments.
    clientSecret: '',
    audience: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
    apiBase: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
    authorizeEndpoint: 'https://auth.tesla.com/oauth2/v3/authorize',
    tokenEndpoint: 'https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token',
    redirectUri: 'https://your-domain.com/auth/callback',
    corsProxyUrl: 'https://corsproxy.io/?key=your-corsproxy-key&url=',
  }
};
