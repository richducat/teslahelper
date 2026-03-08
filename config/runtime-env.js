// Local override file.
// This tracked copy is intentionally safe to commit and ships no secrets.
// Use Vercel environment variables for TESLA_CLIENT_SECRET and backend settings.
window.APP_ENV = {
  ...(window.APP_ENV || {}),
  teslaAuth: {
    ...((window.APP_ENV && window.APP_ENV.teslaAuth) || {}),
  },
};
