(() => {
  const statusEl = document.getElementById('status');
  const detailEl = document.getElementById('detail');
  const homeLink = document.getElementById('home-link');

  const TESLA_AUTH_STORAGE_KEY = 'teslahelper.teslaAuth';
  const TESLA_AUTH_STATE_KEY = 'teslahelper.teslaAuth.state';
  const REDIRECT_TARGET = '/start';

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');
  const state = urlParams.get('state');

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
    if (stored && state && stored !== state) {
      setStatus('State check failed', true, 'We could not verify this login attempt. Please start again.');
      return false;
    }
    return true;
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
      const response = await fetch('/api/tesla/auth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      });

      if (!response.ok) {
        let reason = 'Token exchange failed';
        try {
          const payload = await response.json();
          reason = payload.error || payload.message || reason;
        } catch (parseErr) {
          /* ignore */
        }
        throw new Error(reason);
      }

      persistAuth({ status: 'connected', linkedAt: new Date().toISOString() });
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
