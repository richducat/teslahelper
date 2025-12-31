(() => {
  const statusEl = document.getElementById('status');
  const detailEl = document.getElementById('detail');
  const homeLink = document.getElementById('home-link');

  const TESLA_AUTH_STORAGE_KEY = 'teslahelper.teslaAuth';
  const TESLA_AUTH_STATE_KEY = 'teslahelper.teslaAuth.state';
  const TESLA_REDIRECT_URI =
    (typeof window !== 'undefined' && window.APP_ENV?.teslaAuth?.redirectUri) ||
    (typeof process !== 'undefined' &&
      (process.env.NEXT_PUBLIC_TESLA_REDIRECT_URI || process.env.TESLA_REDIRECT_URI)) ||
    'https://teslahelper.app/auth/callback';
  const REDIRECT_TARGET = '/start';

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  const state = urlParams.get('state');

  const env = (key) => {
    if (typeof process !== 'undefined' && process.env?.[key]) return process.env[key];
    return undefined;
  };

  const teslaEnv = (typeof window !== 'undefined' && window.APP_ENV?.teslaAuth) || {};

  const TESLA_AUTH_CONFIG = {
    clientId: env('NEXT_PUBLIC_TESLA_CLIENT_ID') || teslaEnv.clientId || 'ownerapi',
    clientSecret: env('TESLA_CLIENT_SECRET') || teslaEnv.clientSecret || '',
    audience: teslaEnv.audience || 'https://fleet-api.prd.vn.cloud.tesla.com',
    tokenEndpoint: teslaEnv.tokenEndpoint || 'https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3/token',
    redirectUri: TESLA_REDIRECT_URI,
  };
  const TESLA_CORS_PROXY = 'https://corsproxy.io/';

  const setStatus = (message, isError = false, detail = '') => {
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `text-sm ${isError ? 'text-amber-300' : 'text-neutral-200'}`;
    }
    if (detailEl) {
      detailEl.textContent = detail;
    }
    if (homeLink && isError) {
      homeLink.classList.remove('hidden');
    }
  };

  const persistAuth = (payload) => {
    try {
      localStorage.setItem(TESLA_AUTH_STORAGE_KEY, JSON.stringify(payload));
    } catch (storageError) {
      console.warn('TeslaHelper: unable to store auth payload', storageError);
    }
  };

  const validateState = () => {
    if (typeof sessionStorage === 'undefined') return true;
    const stored = sessionStorage.getItem(TESLA_AUTH_STATE_KEY);
    if (stored && (!state || stored !== state)) {
      setStatus('State check failed', true, 'We could not verify this login attempt. Please start again.');
      return false;
    }
    return true;
  };

  const exchangeToken = async (authCode) => {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: TESLA_AUTH_CONFIG.clientId,
      code: authCode,
      redirect_uri: TESLA_AUTH_CONFIG.redirectUri,
    });

    if (TESLA_AUTH_CONFIG.clientSecret) {
      params.append('client_secret', TESLA_AUTH_CONFIG.clientSecret);
    }
    if (TESLA_AUTH_CONFIG.audience) {
      params.append('audience', TESLA_AUTH_CONFIG.audience);
    }

    const response = await fetch(`${TESLA_CORS_PROXY}${TESLA_AUTH_CONFIG.tokenEndpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      let reason = 'Token exchange failed';
      try {
        const payload = await response.json();
        reason = payload.error_description || payload.error || reason;
      } catch (err) {
        /* ignore parse error */
      }
      throw new Error(reason);
    }

    return response.json();
  };

  const completeLogin = async () => {
    if (error) {
      setStatus('Tesla sign-in was cancelled or blocked.', true, error);
      return;
    }

    if (!code) {
      setStatus('No authorization code detected.', true, 'Return to TeslaHelper and try connecting again.');
      return;
    }

    if (!validateState()) return;

    try {
      setStatus('Exchanging code for tokens…');
      const token = await exchangeToken(code);
      const payload = {
        status: 'connected',
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: Date.now() + (token.expires_in || 0) * 1000,
      };
      persistAuth(payload);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(TESLA_AUTH_STATE_KEY);
      }
      setStatus('Signed in with Tesla. Redirecting…');
      setTimeout(() => {
        window.location.href = REDIRECT_TARGET;
      }, 600);
    } catch (err) {
      setStatus('Unable to finish Tesla sign-in.', true, err?.message || 'Token exchange failed.');
    }
  };

  completeLogin();
})();
