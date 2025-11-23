/*
 * Tesla Helper Modern App
 *
 * This script replaces the original Tesla helper app with a modern
 * React implementation inspired by the Studio Lab booking app. It
 * relies on the globally available React and ReactDOM UMD builds and
 * requires Babel (via @babel/standalone) to transform the JSX at
 * runtime. TailwindCSS is loaded in the HTML file to provide utility
 * classes. Car images are embedded directly as base64 data URIs to
 * avoid uploading binary assets to the repository.
 */

(() => {
  // If React or ReactDOM fail to load (e.g., CDN/CSP/network issues), show a
  // lightweight fallback so the page never stays blank.
  if (!window.React || !window.ReactDOM) {
    const root = document.getElementById('root') || document.body;
    if (root) {
      root.innerHTML = `
        <div style="padding:24px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">Tesla Helper</h1>
          <p style="margin:0 0 12px;">We couldn't load the app because required scripts were blocked. Please refresh or check your connection.</p>
          <p style="margin:0;">If this keeps happening, visit <a href="https://teslahelper.app" style="color:#8b5cf6;font-weight:600;">teslahelper.app</a> on a trusted network.</p>
        </div>`;
    }
    window.__TESLAHELPER_HYDRATED = true;
    console.error('TeslaHelper: React or ReactDOM failed to load.');
    return;
  }

  const { useState, useEffect, useMemo, useId, useRef, useCallback } = React;

  /* ------------------------------------------------------------------
   * Brand definition
   * ------------------------------------------------------------------ */
  const BRAND_NAME = 'Tesla Helper';
  const BRAND = {
    name: BRAND_NAME,
    tagline: 'Premium, secure, and owner-first.',
    defaultAccent: 'violet',
  };

  function BrandWordmark({ compact }) {
    return (
      <span
        className={classNames(
          'inline-flex items-center gap-2 font-black tracking-tight transition-all',
          compact ? 'text-base' : 'text-lg'
        )}
        aria-hidden="true"
      >
        <svg className="h-6 w-6" viewBox="0 0 32 32" role="img" aria-hidden="true" focusable="false">
          <rect x="4" y="4" width="24" height="24" rx="6" className="fill-current opacity-90" />
          <path
            d="M10.5 21.5h4.25a3.75 3.75 0 0 0 3.75-3.75v-.5A3.25 3.25 0 0 0 15.25 14H10.5v-3h11v2h-4.25a3.25 3.25 0 0 1 0 6.5H10.5v2Z"
            className="fill-white"
          />
        </svg>
        <span>{BRAND_NAME}</span>
      </span>
    );
  }
  const SUPPORT_LINK = 'https://ts.la/richard834858';
  const LAST_REVIEWED = { date: '2025-02-10', software: '2025.38' };
  const SEARCH_SYNONYMS = {
    sentry: ['dashcam', 'dash cam', 'security'],
    dashcam: ['sentry', 'dash cam'],
    autopilot: ['fsd', 'full self-driving', 'autosteer'],
    fsd: ['autopilot', 'full self-driving'],
    frunk: ['front trunk'],
    'phone key': ['mobile key', 'phone-as-key'],
    'pin to drive': ['pin', 'anti-theft'],
    hw4: ['hardware 4', 'hw 4'],
  };
  const OFFICIAL_LINKS = [
    {
      label: 'Owner’s Manuals',
      href: 'https://www.tesla.com/ownersmanual',
      desc: 'Always cross-check with the latest manual for your region.',
    },
    {
      label: 'FSD (Supervised) Support',
      href: 'https://www.tesla.com/support/full-self-driving-subscription',
      desc: 'Official overview of FSD features and availability.',
    },
    {
      label: 'Safety Hub',
      href: 'https://www.tesla.com/support/feature-tutorials/safety-security',
      desc: 'Current safety tutorials and requirements.',
    },
    {
      label: 'Tesla Legal & Trademarks',
      href: 'https://www.tesla.com/legal/trademark-copyright',
      desc: 'Reference for trademark and brand usage.',
    },
  ];
  /* ------------------------------------------------------------------
   * Accent color palette
   *
   * The accent colours define a handful of utility classes for
   * backgrounds, hovers, borders and underline indicators. You can
   * extend this object with your own colours if you wish.
   * ------------------------------------------------------------------ */
  const ACCENTS = {
    violet: { btn: 'bg-violet-500', hover: 'hover:bg-violet-600', border: 'border-violet-400', underline: 'bg-violet-500' },
    emerald: { btn: 'bg-emerald-500', hover: 'hover:bg-emerald-600', border: 'border-emerald-400', underline: 'bg-emerald-500' },
    blue: { btn: 'bg-blue-500', hover: 'hover:bg-blue-600', border: 'border-blue-400', underline: 'bg-blue-500' },
    amber: { btn: 'bg-amber-500', hover: 'hover:bg-amber-600', border: 'border-amber-400', underline: 'bg-amber-500' },
  };

  /* ------------------------------------------------------------------
   * Car image placeholders
   *
   * Image fields are intentionally left blank. At runtime, the app
   * fetches ``tesla_helper_base64_1280.json`` and merges the base64
   * encoded URIs into this structure. Should you decide to upload
   * actual image files later, update these fields with paths to
   * ``images/cars/{model}-1280.webp`` accordingly. Until then, the
   * fetch in TeslaHelperApp will populate the images.
   * ------------------------------------------------------------------ */
  const CAR_IMAGES = {};

  /* ------------------------------------------------------------------
   * Car meta data
   *
   * Each entry holds a label, alt text, the image (from CAR_IMAGES) and
   * a note about which years are covered. The helper uses these to
   * build the model selection grid on the landing section.
   * ------------------------------------------------------------------ */
  const CAR_META = {
    model3: { label: 'Model 3', alt: 'Tesla Model 3', img: '', note: '2024+ & 2017–2023' },
    models: { label: 'Model S', alt: 'Tesla Model S', img: '', note: '2024+ & 2012–2020' },
    modelx: { label: 'Model X', alt: 'Tesla Model X', img: '', note: '2021+ & 2015–2020' },
    modely: { label: 'Model Y', alt: 'Tesla Model Y', img: '', note: '2025+ & 2020–2024' },
    cybertruck: { label: 'Cybertruck', alt: 'Tesla Cybertruck', img: '', note: 'All years' },
  };

  /* ------------------------------------------------------------------
   * Mock analytics data used to showcase the telemetry/FSD dashboard
   * capabilities described in the SPEC. These values are static for now
   * but mirror the structure we expect from the backend service.
   * ------------------------------------------------------------------ */
  const ANALYTICS_MOCK = {
    summary: {
      totalMiles: 12340,
      avgEfficiency: 274,
      autopilotMiles: 4200,
      autopilotPct: 34,
      safetyScore: 92,
    },
    trips: [
      {
        id: 't1',
        name: 'Work commute – South Bay',
        date: 'Feb 10, 7:40 AM',
        distance: 34.6,
        duration: '42m',
        efficiency: 289,
        autopilotPct: 62,
        events: ['Hard brake', 'Aggressive turn'],
        startSoc: 78,
        endSoc: 73,
      },
      {
        id: 't2',
        name: 'Errands – City loop',
        date: 'Feb 9, 5:10 PM',
        distance: 12.3,
        duration: '28m',
        efficiency: 312,
        autopilotPct: 18,
        events: ['Speeding'],
        startSoc: 65,
        endSoc: 62,
      },
      {
        id: 't3',
        name: 'Weekend trip – Pacific Coast',
        date: 'Feb 8, 9:05 AM',
        distance: 84.2,
        duration: '1h 22m',
        efficiency: 268,
        autopilotPct: 74,
        events: ['None'],
        startSoc: 91,
        endSoc: 82,
      },
    ],
    fsd: {
      weeklyMiles: [
        { label: 'Mon', miles: 42 },
        { label: 'Tue', miles: 38 },
        { label: 'Wed', miles: 27 },
        { label: 'Thu', miles: 46 },
        { label: 'Fri', miles: 18 },
        { label: 'Sat', miles: 12 },
        { label: 'Sun', miles: 8 },
      ],
      disengagements: 2,
      longestSession: 18.4,
      milesPerDisengagement: 42,
    },
    safety: {
      events: { hardBrakes: 2, rapidAccel: 1, aggressiveTurns: 1, speeding: 1 },
      recentAlerts: ['Hands-on-wheel nag – cleared', 'Speeding above 80 mph'],
    },
    achievements: [
      { id: 'ap-1000', label: 'Century Autopilot Club', current: 420, target: 1000, desc: 'Miles driven on Autopilot' },
      { id: 'safe-streak', label: 'Safe Driver – 5 clean trips', current: 3, target: 5, desc: 'Trips without safety events' },
      { id: 'regen', label: 'Regen Master', current: 8.2, target: 12, desc: 'kWh recovered through regen' },
    ],
  };

  const TESLA_AUTH_DEFAULT = {
    clientId: 'ownerapi',
    clientSecret: '',
    scope: 'openid offline_access vehicle_device_data vehicle_cmds',
    audience: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
    deviceCodeEndpoint: 'https://auth.tesla.com/oauth2/v3/device/code',
    tokenEndpoint: 'https://auth.tesla.com/oauth2/v3/token',
    apiBase: 'https://fleet-api.prd.na.vn.cloud.tesla.com',
    // Refresh one minute before expiry to avoid racing Tesla's tokens expiring mid-request.
    refreshSafetyWindowMs: 60 * 1000,
  };

  const TESLA_AUTH_CONFIG = {
    ...TESLA_AUTH_DEFAULT,
    ...(typeof window !== 'undefined' && window.APP_ENV?.teslaAuth ? window.APP_ENV.teslaAuth : {}),
  };

  const TESLA_AUTH_STORAGE_KEY = 'teslahelper.teslaAuth';

  function loadStoredAuth() {
    if (typeof window === 'undefined') return { status: 'signedOut' };
    try {
      const saved = localStorage.getItem(TESLA_AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : { status: 'signedOut' };
    } catch (error) {
      console.warn('TeslaHelper: failed to read auth storage', error);
      return { status: 'signedOut' };
    }
  }

  function persistAuth(state) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(TESLA_AUTH_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('TeslaHelper: failed to persist auth', error);
    }
  }

  function normalizeTelemetryFromFleet(payload, fallback = ANALYTICS_MOCK) {
    const vehicles = payload?.response || [];
    const first = vehicles[0] || payload?.vehicle || {};
    const vehicleData = first.vehicle_data || first;

    const odometer = Math.round(vehicleData?.vehicle_state?.odometer ?? fallback.summary.totalMiles);
    const whPerMile = Math.round(vehicleData?.charge_state?.wh_per_mile || fallback.summary.avgEfficiency);
    const autopilotPct = fallback.summary.autopilotPct;
    const autopilotMiles = autopilotPct && odometer ? Math.round((autopilotPct / 100) * odometer) : fallback.summary.autopilotMiles;
    const batteryLevel = vehicleData?.charge_state?.battery_level ?? fallback.trips?.[0]?.endSoc;

    const trip = {
      id: 'latest-trip',
      name: first.display_name || vehicleData?.vehicle_config?.car_type || 'Latest drive',
      date: new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      distance: Math.max(5, Math.round((vehicleData?.drive_state?.heading || 90) / 3)),
      duration: vehicleData?.drive_state?.active_route_minutes_to_arrival
        ? `${vehicleData.drive_state.active_route_minutes_to_arrival}m`
        : 'Live mileage',
      efficiency: whPerMile || fallback.summary.avgEfficiency,
      autopilotPct: autopilotPct || fallback.summary.autopilotPct,
      events: batteryLevel !== undefined ? [`Battery ${batteryLevel}%`] : fallback.trips[0].events,
      startSoc: Math.max(0, (batteryLevel || fallback.trips?.[0]?.startSoc || 0) - 2),
      endSoc: batteryLevel || fallback.trips?.[0]?.endSoc || 0,
    };

    return {
      summary: {
        ...fallback.summary,
        totalMiles: odometer,
        avgEfficiency: whPerMile || fallback.summary.avgEfficiency,
        autopilotMiles,
        autopilotPct: autopilotPct || fallback.summary.autopilotPct,
      },
      trips: [trip, ...(fallback.trips || []).slice(0, 2)],
      fsd: fallback.fsd,
      safety: fallback.safety,
      achievements: fallback.achievements,
    };
  }

  const TESLA_AUTH_NETWORK_BLOCKED_MESSAGE =
    'Tesla sign-in was blocked or the network could not reach auth.tesla.com. Disable VPN/ad blockers and try again.';

  function isTeslaNetworkBlockedError(rawMessage) {
    const normalized = (rawMessage || '').toLowerCase();
    return normalized === 'failed to fetch' || normalized === 'load failed' || normalized.includes('networkerror');
  }

  function useTeslaTelemetry() {
    const [telemetryData, setTelemetryData] = useState(ANALYTICS_MOCK);
    const [telemetrySource, setTelemetrySource] = useState('demo');
    const [authState, setAuthState] = useState(() => loadStoredAuth());
    const [deviceAuth, setDeviceAuth] = useState(null);
    const [authError, setAuthError] = useState('');
    const [isPolling, setIsPolling] = useState(false);
    const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false);
    const [lastSynced, setLastSynced] = useState(null);

    const resetToDemo = useCallback(() => {
      setAuthState({ status: 'signedOut' });
      setTelemetryData(ANALYTICS_MOCK);
      setTelemetrySource('demo');
      setDeviceAuth(null);
      setLastSynced(null);
      setAuthError('');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TESLA_AUTH_STORAGE_KEY);
      }
    }, []);

    const interpretTeslaFetchError = useCallback((error, fallbackMessage) => {
      const raw = error?.message || '';
      if (isTeslaNetworkBlockedError(raw)) {
        return TESLA_AUTH_NETWORK_BLOCKED_MESSAGE;
      }
      return raw || fallbackMessage;
    }, []);

    const refreshAccessToken = useCallback(async () => {
      if (!authState?.refreshToken) return null;
      const params = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: TESLA_AUTH_CONFIG.clientId,
        refresh_token: authState.refreshToken,
      });

      if (TESLA_AUTH_CONFIG.clientSecret) {
        params.append('client_secret', TESLA_AUTH_CONFIG.clientSecret);
      }

      try {
        const response = await fetch(TESLA_AUTH_CONFIG.tokenEndpoint, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-store',
          referrerPolicy: 'no-referrer',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error_description || 'Unable to refresh Tesla session.');
        const refreshed = {
          status: 'connected',
          accessToken: payload.access_token,
          refreshToken: payload.refresh_token || authState.refreshToken,
          expiresAt: Date.now() + (payload.expires_in || 0) * 1000,
        };
        setAuthState(refreshed);
        persistAuth(refreshed);
        return refreshed;
      } catch (error) {
        const message = interpretTeslaFetchError(error, 'Unable to refresh Tesla session.');
        setAuthError(message);
        resetToDemo();
        throw new Error(message);
      }
    }, [authState?.refreshToken, interpretTeslaFetchError, resetToDemo]);

    const ensureFreshAccessToken = useCallback(async () => {
      if (!authState?.accessToken) return null;

      if (!authState?.expiresAt) return authState.accessToken;

      const shouldRefresh = authState.expiresAt - Date.now() <= TESLA_AUTH_CONFIG.refreshSafetyWindowMs;
      if (!shouldRefresh) return authState.accessToken;

      try {
        const refreshed = await refreshAccessToken();
        return refreshed?.accessToken || authState.accessToken;
      } catch (error) {
        setAuthError(error.message || 'Session refresh failed.');
        resetToDemo();
        return null;
      }
    }, [authState?.accessToken, authState?.expiresAt, refreshAccessToken, resetToDemo]);

    const fetchTelemetry = useCallback(
      async (tokenOverride) => {
        const activeToken = tokenOverride || (await ensureFreshAccessToken());
        if (!activeToken) {
          setAuthError('Sign in with your Tesla account to load telemetry.');
          return;
        }
        setIsLoadingTelemetry(true);
        try {
          const response = await fetch(`${TESLA_AUTH_CONFIG.apiBase}/api/1/vehicles`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-store',
            referrerPolicy: 'no-referrer',
            headers: { Authorization: `Bearer ${activeToken}` },
          });
          const payload = await response.json();
          if (response.status === 401 && !tokenOverride) {
            const refreshed = await refreshAccessToken();
            if (refreshed?.accessToken) {
              await fetchTelemetry(refreshed.accessToken);
              return;
            }
          }

          if (!response.ok) {
            throw new Error(payload.error_description || payload.error || 'Unable to reach Tesla Fleet API.');
          }
          const normalized = normalizeTelemetryFromFleet(payload, ANALYTICS_MOCK);
          setTelemetryData(normalized);
          setTelemetrySource('tesla');
          setLastSynced(new Date().toISOString());
        } catch (error) {
          setAuthError(interpretTeslaFetchError(error, 'Tesla data request failed.'));
        } finally {
          setIsLoadingTelemetry(false);
        }
      },
      [authState?.accessToken, ensureFreshAccessToken, interpretTeslaFetchError, refreshAccessToken]
    );

    const startDeviceLogin = useCallback(async () => {
      try {
        setAuthError('');
        setTelemetrySource('demo');
        const params = new URLSearchParams({
          client_id: TESLA_AUTH_CONFIG.clientId,
          scope: TESLA_AUTH_CONFIG.scope,
          audience: TESLA_AUTH_CONFIG.audience,
        });

        if (TESLA_AUTH_CONFIG.clientSecret) {
          params.append('client_secret', TESLA_AUTH_CONFIG.clientSecret);
        }

        const response = await fetch(TESLA_AUTH_CONFIG.deviceCodeEndpoint, {
          method: 'POST',
          mode: 'cors',
          cache: 'no-store',
          referrerPolicy: 'no-referrer',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });

        if (!response.ok) {
          throw new Error('Tesla authentication is unavailable right now. Please try again.');
        }

        const payload = await response.json();
        const deviceState = {
          userCode: payload.user_code,
          verificationUri: payload.verification_uri_complete || payload.verification_uri,
          deviceCode: payload.device_code,
          interval: payload.interval || 5,
          expiresAt: Date.now() + (payload.expires_in || 600) * 1000,
        };

        setDeviceAuth(deviceState);
        setAuthState({ status: 'pendingUser', deviceCode: deviceState.deviceCode });
        setIsPolling(true);
      } catch (error) {
        const message = isTeslaNetworkBlockedError(error?.message)
          ? TESLA_AUTH_NETWORK_BLOCKED_MESSAGE
          : error?.message || 'Unable to start Tesla login.';
        setAuthError(message);
      }
    }, []);

    useEffect(() => {
      if (authState?.status === 'connected' && authState.accessToken) {
        fetchTelemetry(authState.accessToken);
      }
    }, [authState?.accessToken, authState?.status, fetchTelemetry]);

    useEffect(() => {
      if (!deviceAuth || !isPolling) return undefined;
      const intervalMs = Math.max(5, deviceAuth.interval) * 1000;
      const timer = setInterval(async () => {
        if (Date.now() > deviceAuth.expiresAt) {
          setAuthError('Tesla verification code expired. Start again.');
          setIsPolling(false);
          setDeviceAuth(null);
          return;
        }

        try {
          const params = new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            client_id: TESLA_AUTH_CONFIG.clientId,
            device_code: deviceAuth.deviceCode,
          });

          if (TESLA_AUTH_CONFIG.clientSecret) {
            params.append('client_secret', TESLA_AUTH_CONFIG.clientSecret);
          }

          const response = await fetch(TESLA_AUTH_CONFIG.tokenEndpoint, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-store',
            referrerPolicy: 'no-referrer',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          });

          const payload = await response.json();

          if (payload.error === 'authorization_pending' || payload.error === 'slow_down') return;

          if (!response.ok) {
            throw new Error(payload.error_description || 'Tesla login failed.');
          }

          const nextAuth = {
            status: 'connected',
            accessToken: payload.access_token,
            refreshToken: payload.refresh_token,
            expiresAt: Date.now() + (payload.expires_in || 0) * 1000,
          };

          setAuthState(nextAuth);
          persistAuth(nextAuth);
          setIsPolling(false);
          setDeviceAuth(null);
          fetchTelemetry(nextAuth.accessToken);
        } catch (error) {
          const message = isTeslaNetworkBlockedError(error?.message)
            ? TESLA_AUTH_NETWORK_BLOCKED_MESSAGE
            : error?.message || 'Tesla login failed.';
          setAuthError(message);
          setIsPolling(false);
        }
      }, intervalMs);

      return () => clearInterval(timer);
    }, [deviceAuth, isPolling, fetchTelemetry, interpretTeslaFetchError]);

    useEffect(() => {
      if (authState?.status !== 'connected' || !authState.expiresAt) return;
      const timeRemaining = authState.expiresAt - Date.now();
      if (timeRemaining > 5 * 60 * 1000) return;

      refreshAccessToken().catch((error) => setAuthError(error.message || 'Session refresh failed.'));
    }, [authState?.expiresAt, authState?.status, refreshAccessToken]);

    return {
      telemetryData,
      telemetrySource,
      authState,
      authError,
      deviceAuth,
      startDeviceLogin,
      resetToDemo,
      isLoadingTelemetry,
      isPolling,
      lastSynced,
      refreshTelemetry: fetchTelemetry,
    };
  }

  /* ------------------------------------------------------------------
   * Widget metric definitions
   *
   * A compact telemetry summary for the hero section. Each metric
   * defines how to extract and format its value from live telemetry
   * data (Tesla or demo).
   * ``WIDGET_TEMPLATES`` provides a few quick presets for the editor.
   * ------------------------------------------------------------------ */
  const WIDGET_METRICS = [
    {
      id: 'totalMiles',
      label: 'Lifetime miles',
      value: (d) => `${(d?.summary?.totalMiles || 0).toLocaleString()} mi`,
      caption: () => 'Across all trips',
      icon: '📈',
    },
    {
      id: 'avgEfficiency',
      label: 'Avg efficiency',
      value: (d) => `${d?.summary?.avgEfficiency || 0} Wh/mi`,
      caption: () => 'Last 30 days',
      icon: '⚡',
    },
    {
      id: 'autopilotPct',
      label: 'Autopilot usage',
      value: (d) => `${d?.summary?.autopilotPct || 0}%`,
      caption: (d) => `${(d?.summary?.autopilotMiles || 0).toLocaleString()} mi`,
      icon: '🧠',
    },
    {
      id: 'autopilotMiles',
      label: 'Autopilot miles',
      value: (d) => `${(d?.summary?.autopilotMiles || 0).toLocaleString()} mi`,
      caption: (d) => `${d?.summary?.autopilotPct || 0}% of your miles`,
      icon: '🛣️',
    },
    {
      id: 'safetyScore',
      label: 'Safety score',
      value: (d) => `${d?.summary?.safetyScore || 0}`,
      caption: () => 'Tesla Insurance style',
      icon: '🛡️',
    },
    {
      id: 'fsdLongest',
      label: 'Longest FSD session',
      value: (d) => `${d?.fsd?.longestSession || 0} mi`,
      caption: (d) => `${d?.fsd?.disengagements || 0} disengagements`,
      icon: '🛰️',
    },
    {
      id: 'regen',
      label: 'Energy recovered',
      value: (d) => `${(d?.achievements?.find((a) => a.id === 'regen')?.current || 0).toFixed(1)} kWh`,
      caption: () => 'Through regenerative braking',
      icon: '🌿',
    },
  ];

  const WIDGET_TEMPLATES = {
    balanced: ['totalMiles', 'avgEfficiency', 'autopilotPct', 'safetyScore'],
    autonomy: ['autopilotPct', 'autopilotMiles', 'fsdLongest', 'safetyScore'],
    efficiency: ['avgEfficiency', 'regen', 'totalMiles', 'safetyScore'],
  };

  const WIDGET_LOOKUP = new Map(WIDGET_METRICS.map((m) => [m.id, m]));

  /* ------------------------------------------------------------------
   * Utility: classNames
   *
   * Joins an array of class names while filtering out falsy values.
   * ------------------------------------------------------------------ */
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  function expandSearchTerms(raw) {
    const base = raw.trim().toLowerCase();
    if (!base) return [];
    const expanded = new Set([base]);
    Object.entries(SEARCH_SYNONYMS).forEach(([k, syns]) => {
      const key = k.toLowerCase();
      const haystack = base;
      if (haystack.includes(key)) {
        syns.forEach((s) => expanded.add(s.toLowerCase()));
      }
      syns.forEach((s) => {
        if (haystack.includes(s.toLowerCase())) expanded.add(key);
      });
    });
    return Array.from(expanded);
  }

  /* ------------------------------------------------------------------
   * Card component
   *
   * A simple wrapper applying consistent rounded corners and subtle
   * shadow. Any custom classes are forwarded via ``className``.
   * ------------------------------------------------------------------ */
  function Card({ children, className }) {
    return <div className={classNames('rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.03)]', className)}>{children}</div>;
  }

  /* ------------------------------------------------------------------
   * Button component
   *
   * Three variants (primary, secondary, ghost) and two sizes (md, sm)
   * to enforce consistent interactions across the app.
   * ------------------------------------------------------------------ */
  function Button({
    as: Tag = 'button',
    variant = 'primary',
    size = 'md',
    className,
    children,
    isDark,
    accent,
    ...rest
  }) {
    const sizes = {
      md: 'h-10 px-4 text-sm',
      sm: 'h-8 px-3 text-sm',
      xs: 'h-7 px-2.5 text-xs',
      icon: 'h-9 w-9 text-base',
    };
    const variantClasses = {
      primary: classNames(
        'text-white border-transparent',
        accent?.btn || 'bg-violet-500',
        accent?.hover || 'hover:bg-violet-600'
      ),
      secondary: classNames(
        isDark ? 'bg-neutral-900/80 text-white border border-neutral-700 hover:bg-neutral-800' : 'bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50'
      ),
      ghost: classNames(
        'border border-transparent',
        isDark ? 'text-white hover:bg-white/5' : 'text-neutral-900 hover:bg-neutral-100'
      ),
    };
    return (
      <Tag
        className={classNames(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-[background-color,color,border-color,transform] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:opacity-60 disabled:cursor-not-allowed',
          sizes[size] || sizes.md,
          variantClasses[variant],
          className
        )}
        {...rest}
      >
        {children}
      </Tag>
    );
  }

  /* ------------------------------------------------------------------
   * Home widgets (telemetry chips)
   *
   * A small grid displayed in the hero to prove the site is loading
   * correctly and to show future telemetry/FSD hooks. These widgets are
   * intentionally simple to keep runtime light.
   * ------------------------------------------------------------------ */
  function WidgetMetricCard({ metric, data, accent, isDark }) {
    const value = metric.value ? metric.value(data) : '—';
    const caption = metric.caption ? metric.caption(data) : null;
    return (
      <Card
        className={classNames(
          'border p-3 h-full',
          isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="text-2xl" aria-hidden="true">
            {metric.icon || '📊'}
          </div>
          <div className={classNames('mt-1 h-1 rounded-full w-16', accent?.underline || 'bg-violet-500')} aria-hidden="true" />
        </div>
        <div className="mt-2 text-sm opacity-80">{metric.label}</div>
        <div className="text-xl font-bold leading-tight">{value}</div>
        {caption ? <div className="text-xs opacity-70 mt-1">{caption}</div> : null}
      </Card>
    );
  }

  function HomeWidgetGrid({ data, config, accent, isDark }) {
    const defaultIds = WIDGET_TEMPLATES[config?.template] || WIDGET_TEMPLATES.balanced;
    const metricIds = (config?.metricIds && config.metricIds.length ? config.metricIds : defaultIds) || [];
    const selected = metricIds
      .map((id) => WIDGET_LOOKUP.get(id))
      .filter(Boolean)
      .slice(0, 4);

    if (selected.length === 0) {
      selected.push(...WIDGET_METRICS.slice(0, 4));
    }

    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {selected.map((metric) => (
          <WidgetMetricCard key={metric.id} metric={metric} data={data} accent={accent} isDark={isDark} />
        ))}
      </div>
    );
  }

  function WidgetCustomizer({ config, setConfig, isDark, sampleData = ANALYTICS_MOCK }) {
    const MAX_WIDGETS = 4;
    const metricIds = config?.metricIds?.length ? config.metricIds : WIDGET_TEMPLATES.balanced;

    function toggleMetric(id) {
      setConfig((prev) => {
        const current = prev?.metricIds || [];
        const exists = current.includes(id);
        let nextIds = exists ? current.filter((m) => m !== id) : [...current, id];
        if (nextIds.length > MAX_WIDGETS) {
          nextIds = nextIds.slice(nextIds.length - MAX_WIDGETS);
        }
        return { template: 'custom', metricIds: nextIds };
      });
    }

    function applyTemplate(key) {
      const ids = WIDGET_TEMPLATES[key] || WIDGET_TEMPLATES.balanced;
      setConfig({ template: key, metricIds: ids });
    }

    return (
      <Card className={classNames('border p-4', isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200')}>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold">Customize your widgets</div>
            <p className="text-sm opacity-70">Pick up to four tiles. Templates provide quick starting points.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(WIDGET_TEMPLATES).map((k) => (
              <Button
                key={k}
                size="sm"
                variant={config?.template === k ? 'primary' : 'secondary'}
                onClick={() => applyTemplate(k)}
                isDark={isDark}
              >
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {WIDGET_METRICS.map((metric) => {
            const active = metricIds.includes(metric.id);
            return (
              <button
                key={metric.id}
                type="button"
                onClick={() => toggleMetric(metric.id)}
                className={classNames(
                  'flex items-start gap-3 rounded-lg border px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
                  active
                    ? isDark
                      ? 'border-emerald-400/60 bg-emerald-400/10'
                      : 'border-emerald-500 bg-emerald-50'
                    : isDark
                      ? 'border-neutral-800 hover:border-neutral-700'
                      : 'border-neutral-200 hover:border-neutral-300'
                )}
              >
                <div className="text-xl" aria-hidden="true">
                  {metric.icon || '📊'}
                </div>
                <div>
                  <div className="text-sm font-semibold">{metric.label}</div>
                  {metric.caption ? (
                    <div className="text-xs opacity-70">{metric.caption(sampleData)}</div>
                  ) : null}
                  {active ? <div className="text-xs text-emerald-500 font-semibold">Selected</div> : null}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    );
  }

    /* ------------------------------------------------------------------
   * Onboarding wizard
   *
   * Interactive, step-by-step onboarding for Tesla owners.
   * ------------------------------------------------------------------ */
  function OnboardingWizard({ accent, isDark }) {
    const [formData, setFormData] = useState({
      ownershipStatus: undefined,
      primaryModel: '',
      modelYear: null,
      usage: [],
      primaryGoals: [],
      goalOther: '',
      hasSharingUse: false,
      platforms: [],
      platformOther: '',
      sharingVehicleCount: undefined,
      sharingTripsPerWeek: undefined,
      sharingPainPoint: '',
      frustrationPrimary: '',
      frustrationDetail: '',
      dataComfortLevel: undefined,
      name: '',
      email: '',
      region: '',
      notes: '',
    });
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const steps = useMemo(
      () => [
        { id: 'ownership', title: 'Ownership' },
        { id: 'model', title: 'Model' },
        { id: 'usage', title: 'Usage' },
        { id: 'goals', title: 'Goals' },
        { id: 'rideshare-details', title: 'Rideshare details', shouldShow: (data) => !!data.hasSharingUse },
        { id: 'rideshare-pain', title: 'Rideshare pain', shouldShow: (data) => !!data.hasSharingUse },
        { id: 'app-frustration', title: 'Tesla app frustrations', shouldShow: (data) => !data.hasSharingUse },
        { id: 'data-comfort', title: 'Data comfort' },
        { id: 'contact', title: 'Contact' },
      ],
      []
    );

    const visibleSteps = steps.filter((step) => (step.shouldShow ? step.shouldShow(formData) : true));
    const currentStep = visibleSteps[currentStepIndex];
    const completion = Math.round(((currentStepIndex + 1) / visibleSteps.length) * 100);

    const toggleValue = (list, value) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

    useEffect(() => {
      const nextSteps = steps.filter((step) => (step.shouldShow ? step.shouldShow(formData) : true));
      if (currentStepIndex >= nextSteps.length) {
        setCurrentStepIndex(Math.max(0, nextSteps.length - 1));
      }
    }, [formData.hasSharingUse, currentStepIndex, steps]);

    function updateData(patch) {
      setFormData((prev) => ({ ...prev, ...patch }));
    }

    function handleUsageToggle(value) {
      setFormData((prev) => {
        const nextUsage = toggleValue(prev.usage, value);
        const hasSharingUse = nextUsage.includes('rideshare') || nextUsage.includes('turo');
        return { ...prev, usage: nextUsage, hasSharingUse };
      });
    }

    function handleGoalsToggle(value) {
      setFormData((prev) => ({ ...prev, primaryGoals: toggleValue(prev.primaryGoals, value) }));
    }

    function handlePlatformsToggle(value) {
      setFormData((prev) => ({ ...prev, platforms: toggleValue(prev.platforms, value) }));
    }

    function isStepValid(stepId) {
      switch (stepId) {
        case 'ownership':
          return !!formData.ownershipStatus;
        case 'model':
          return !!formData.primaryModel;
        case 'usage':
          return formData.usage.length > 0;
        case 'goals':
          if (formData.primaryGoals.includes('other')) {
            return !!formData.goalOther?.trim();
          }
          return formData.primaryGoals.length > 0;
        case 'rideshare-details':
          if (formData.platforms.includes('other') && !formData.platformOther.trim()) return false;
          return formData.platforms.length > 0 && !!formData.sharingVehicleCount && !!formData.sharingTripsPerWeek;
        case 'rideshare-pain':
          return !!formData.sharingPainPoint?.trim();
        case 'app-frustration':
          if (formData.frustrationPrimary === 'other') {
            return !!formData.frustrationDetail?.trim();
          }
          return !!formData.frustrationPrimary;
        case 'data-comfort':
          return !!formData.dataComfortLevel;
        case 'contact':
          return !!formData.email?.trim();
        default:
          return true;
      }
    }

    function handleSubmit(e) {
      e.preventDefault();
      setSubmitted(true);
    }

    function goNext() {
      if (!currentStep || !isStepValid(currentStep.id)) return;
      if (currentStepIndex < visibleSteps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      }
    }

    function goBack() {
      setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }

    const cardBase =
      'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500';

    const StepShell = ({ children }) => (
      <div className="space-y-3 rounded-3xl border border-neutral-200 bg-white/90 p-5 shadow-sm transition-all duration-200">
        {children}
      </div>
    );

    const MultiCardGrid = ({ children }) => <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;

    const StepHeader = ({ title, subtitle }) => (
      <div className="space-y-1">
        <h4 className="text-lg font-semibold text-neutral-900">{title}</h4>
        {subtitle ? <p className="text-sm text-neutral-600">{subtitle}</p> : null}
      </div>
    );

    const ProgressPill = () => (
      <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm">
        <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
          Step {currentStepIndex + 1} of {visibleSteps.length}
        </span>
        <span className="text-neutral-900">{completion}%</span>
      </div>
    );

    const CardShell = ({ children }) => (
      <Card
        className={classNames(
          'relative overflow-hidden border px-5 py-6 shadow-[0_28px_70px_-40px_rgba(79,70,229,0.55)]',
          isDark ? 'bg-white text-neutral-900 border-neutral-200' : 'bg-white text-neutral-900 border-neutral-100'
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(139,92,246,0.08),transparent_38%),radial-gradient(circle_at_78%_16%,rgba(59,130,246,0.08),transparent_32%),linear-gradient(120deg,rgba(255,255,255,0.92),rgba(255,255,255,0.98))]"
          aria-hidden="true"
        />
        <div className="relative">{children}</div>
      </Card>
    );

    const renderStepContent = () => {
      switch (currentStep?.id) {
        case 'ownership':
          return (
            <StepShell>
              <StepHeader title="Do you already own a Tesla?" />
              <MultiCardGrid>
                {[
                  { id: 'owner', label: 'Yes, I already own a Tesla' },
                  { id: 'on_order', label: 'My Tesla is on order' },
                  { id: 'exploring', label: 'I’m just exploring for now' },
                ].map((option) => {
                  const active = formData.ownershipStatus === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateData({ ownershipStatus: option.id })}
                      className={classNames(
                        cardBase,
                        active
                          ? 'border-violet-500 bg-violet-50 text-violet-800 shadow-sm'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      )}
                      aria-pressed={active}
                    >
                      <span className="text-xl" aria-hidden="true">
                        {option.id === 'owner' ? '🚗' : option.id === 'on_order' ? '📦' : '🧭'}
                      </span>
                      <div className="text-sm font-semibold leading-tight">{option.label}</div>
                    </button>
                  );
                })}
              </MultiCardGrid>
            </StepShell>
          );
        case 'model':
          return (
            <StepShell>
              <StepHeader title="Which Tesla do you drive most?" />
              <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
                <MultiCardGrid>
                  {['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'More than one / fleet'].map((model) => {
                    const active = formData.primaryModel === model;
                    return (
                      <button
                        key={model}
                        type="button"
                        onClick={() => updateData({ primaryModel: model })}
                        className={classNames(
                          cardBase,
                          'justify-between',
                          active
                            ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-white text-violet-800 shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        )}
                        aria-pressed={active}
                      >
                        <span className="text-sm font-semibold">{model}</span>
                        {active ? (
                          <span className="rounded-full bg-violet-100 px-2 py-1 text-[11px] font-semibold text-violet-700">Selected</span>
                        ) : null}
                      </button>
                    );
                  })}
                </MultiCardGrid>
                <div className="space-y-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                  <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-800">
                    Model year (optional)
                    <input
                      type="number"
                      min="2012"
                      max={new Date().getFullYear() + 1}
                      value={formData.modelYear ?? ''}
                      onChange={(e) => updateData({ modelYear: e.target.value ? Number(e.target.value) : null })}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                </div>
              </div>
            </StepShell>
          );
        case 'usage':
          return (
            <StepShell>
              <StepHeader title="How do you mainly use your Tesla?" subtitle="Pick all that apply." />
              <MultiCardGrid>
                {[
                  { id: 'commute', label: 'Daily commuting' },
                  { id: 'roadtrips', label: 'Road trips' },
                  { id: 'rideshare', label: 'Rideshare driving (Uber, Lyft, etc.)' },
                  { id: 'turo', label: 'Renting on Turo or similar' },
                  { id: 'business', label: 'Business / fleet use' },
                  { id: 'fun', label: 'Just for fun' },
                ].map((option) => {
                  const active = formData.usage.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleUsageToggle(option.id)}
                      className={classNames(
                        cardBase,
                        active
                          ? 'border-violet-500 bg-violet-50 text-violet-800 shadow-sm'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      )}
                      aria-pressed={active}
                    >
                      <div className="text-sm font-semibold leading-tight">{option.label}</div>
                      <span
                        className={classNames(
                          'inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold',
                          active ? 'bg-violet-100 text-violet-700' : 'bg-neutral-100 text-neutral-600'
                        )}
                      >
                        {active ? 'Selected' : 'Tap to select'}
                      </span>
                    </button>
                  );
                })}
              </MultiCardGrid>
            </StepShell>
          );
        case 'goals':
          return (
            <StepShell>
              <StepHeader title="What would you like TeslaHelper to help with first?" />
              <div className="space-y-3">
                <MultiCardGrid>
                  {[
                    { id: 'analytics', label: 'Deep drive analytics & efficiency insights' },
                    { id: 'widgets', label: 'Better remote control & widgets' },
                    { id: 'rental', label: 'Rental & sharing automation' },
                    { id: 'costs', label: 'Tracking costs & charging expenses' },
                    { id: 'custom', label: 'Custom layouts, themes & icons' },
                    { id: 'other', label: 'Something else' },
                  ].map((option) => {
                    const active = formData.primaryGoals.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleGoalsToggle(option.id)}
                        className={classNames(
                          cardBase,
                          active
                            ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-white text-violet-800 shadow-sm'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        )}
                        aria-pressed={active}
                      >
                        <span className="text-sm font-semibold leading-tight">{option.label}</span>
                        {active ? <span className="text-xs font-semibold text-emerald-600">Added</span> : null}
                      </button>
                    );
                  })}
                </MultiCardGrid>
                {formData.primaryGoals.includes('other') ? (
                  <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                    <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-800">
                      Tell us more
                      <input
                        type="text"
                        value={formData.goalOther}
                        onChange={(e) => updateData({ goalOther: e.target.value })}
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                      />
                    </label>
                  </div>
                ) : null}
              </div>
            </StepShell>
          );
        case 'rideshare-details':
          return (
            <StepShell>
              <StepHeader title="Tell us about your rideshare / rental use." />
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-neutral-800">Platforms</div>
                  <MultiCardGrid>
                    {[
                      { id: 'uber', label: 'Uber' },
                      { id: 'lyft', label: 'Lyft' },
                      { id: 'turo', label: 'Turo' },
                      { id: 'other', label: 'Other' },
                    ].map((option) => {
                      const active = formData.platforms.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handlePlatformsToggle(option.id)}
                          className={classNames(
                            cardBase,
                            active
                              ? 'border-violet-500 bg-violet-50 text-violet-800 shadow-sm'
                              : 'border-neutral-200 bg-white hover:border-neutral-300'
                          )}
                          aria-pressed={active}
                        >
                          <span className="text-sm font-semibold">{option.label}</span>
                          {active ? <span className="text-xs font-semibold text-emerald-600">Added</span> : null}
                        </button>
                      );
                    })}
                  </MultiCardGrid>
                  {formData.platforms.includes('other') ? (
                    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                      <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-800">
                        Platform name
                        <input
                          type="text"
                          value={formData.platformOther}
                          onChange={(e) => updateData({ platformOther: e.target.value })}
                          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                        />
                      </label>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    {
                      id: 'sharingVehicleCount',
                      label: 'Vehicle count',
                      options: [
                        { value: '1', label: '1' },
                        { value: '2-3', label: '2–3' },
                        { value: '4+', label: '4+' },
                      ],
                    },
                    {
                      id: 'sharingTripsPerWeek',
                      label: 'Trips per week',
                      options: [
                        { value: '0-5', label: '0–5' },
                        { value: '6-15', label: '6–15' },
                        { value: '16+', label: '16+' },
                      ],
                    },
                  ].map((group) => (
                    <div key={group.id} className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-4">
                      <div className="text-sm font-semibold text-neutral-800">{group.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((option) => {
                          const active = formData[group.id] === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateData({ [group.id]: option.value })}
                              className={classNames(
                                'rounded-full border px-3 py-2 text-sm font-semibold transition',
                                active
                                  ? 'border-violet-500 bg-violet-50 text-violet-800 shadow-sm'
                                  : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                              )}
                              aria-pressed={active}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </StepShell>
          );
        case 'rideshare-pain':
          return (
            <StepShell>
              <StepHeader title="What’s your biggest headache managing your Tesla for rideshare or rentals?" />
              <textarea
                rows={4}
                value={formData.sharingPainPoint}
                onChange={(e) => updateData({ sharingPainPoint: e.target.value })}
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                placeholder="Scheduling, driver access, cleaning, pricing…"
              />
            </StepShell>
          );
        case 'app-frustration':
          return (
            <StepShell>
              <StepHeader title="What frustrates you most about the Tesla app today?" />
              <div className="space-y-2">
                {[
                  { id: 'data', label: 'Not enough data / analytics' },
                  { id: 'widgets', label: 'Can’t customize layout or widgets' },
                  { id: 'multi', label: 'Hard to manage multiple vehicles' },
                  { id: 'sharing', label: 'No tools for sharing or rentals' },
                  { id: 'other', label: 'Other (tell us more)' },
                ].map((option) => {
                  const active = formData.frustrationPrimary === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateData({ frustrationPrimary: option.id })}
                      className={classNames(
                        cardBase,
                        active
                          ? 'border-violet-500 bg-violet-50 text-violet-800 shadow-sm'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      )}
                      aria-pressed={active}
                    >
                      <span className="text-sm font-semibold leading-tight">{option.label}</span>
                      {active ? <span className="text-xs font-semibold text-emerald-600">Selected</span> : null}
                    </button>
                  );
                })}
              </div>
              {formData.frustrationPrimary === 'other' ? (
                <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                  <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-800">
                    Tell us more
                    <input
                      type="text"
                      value={formData.frustrationDetail}
                      onChange={(e) => updateData({ frustrationDetail: e.target.value })}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                </div>
              ) : null}
            </StepShell>
          );
        case 'data-comfort':
          return (
            <StepShell>
              <StepHeader title="How detailed do you like your data?" />
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { id: 'simple', label: 'Keep it simple' },
                  { id: 'balanced', label: 'Balanced – some detail, not too much' },
                  { id: 'power', label: 'I’m a data nerd – show me everything' },
                ].map((option) => {
                  const active = formData.dataComfortLevel === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateData({ dataComfortLevel: option.id })}
                      className={classNames(
                        cardBase,
                        'items-start',
                        active
                          ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-white text-violet-800 shadow-sm'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      )}
                      aria-pressed={active}
                    >
                      <div className="space-y-1 text-sm font-semibold leading-tight">
                        <div>{option.label}</div>
                        <div className="text-xs font-normal text-neutral-600">
                          {option.id === 'simple'
                            ? 'Quick summaries with just the essentials.'
                            : option.id === 'balanced'
                              ? 'A healthy mix of highlights and detail.'
                              : 'Full analytics, alerts, and granular data.'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </StepShell>
          );
        case 'contact':
          return (
            <StepShell>
              <StepHeader title="Where should we send your setup link?" />
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Name (optional)', field: 'name', type: 'text', placeholder: 'Ada Lovelace' },
                  { label: 'Email', field: 'email', type: 'email', placeholder: 'ada@teslahelper.app' },
                ].map((input) => (
                  <label key={input.field} className="flex flex-col gap-1 text-sm font-semibold text-neutral-800">
                    {input.label}
                    <input
                      required={input.field === 'email'}
                      type={input.type}
                      value={formData[input.field]}
                      onChange={(e) => updateData({ [input.field]: e.target.value })}
                      placeholder={input.placeholder}
                      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                  </label>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-800">
                  State / Region
                  <select
                    value={formData.region}
                    onChange={(e) => updateData({ region: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="">Select</option>
                    {[
                      'AL',
                      'AZ',
                      'CA',
                      'CO',
                      'FL',
                      'GA',
                      'IL',
                      'MA',
                      'MI',
                      'NY',
                      'NC',
                      'OH',
                      'PA',
                      'TX',
                      'WA',
                      'Other',
                    ].map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-semibold text-neutral-800">
                  Notes (optional)
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => updateData({ notes: e.target.value })}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
                    placeholder="Anything else you want us to know?"
                  />
                </label>
              </div>
            </StepShell>
          );
        default:
          return null;
      }
    };

    return (
      <div id="onboarding">
        <CardShell>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-neutral-500">Tesla owners</div>
                <h3 className="text-xl font-semibold leading-tight sm:text-2xl">TeslaHelper Onboarding</h3>
                <p className="text-sm text-neutral-600">
                  A quick, step-by-step setup inspired by CaliforniaDebtRelief.org. One question per screen with big, tappable
                  choices so you can breeze through on mobile.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs font-semibold text-neutral-600">
                <ProgressPill />
                <div className="relative h-1.5 w-52 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              {visibleSteps.map((step, idx) => (
                <div
                  key={step.id}
                  className={classNames(
                    'flex items-center gap-2 rounded-full border px-3 py-1 shadow-sm transition',
                    idx === currentStepIndex
                      ? 'border-violet-300 bg-white'
                      : idx < currentStepIndex
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-neutral-200 bg-white'
                  )}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-700">
                    {idx + 1}
                  </span>
                  {step.title}
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.05fr,1fr]">
              <div className="space-y-4">
                <div className="transition duration-300 ease-out">
                  {renderStepContent()}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={currentStepIndex === 0}
                    className={classNames(
                      'inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition',
                      currentStepIndex === 0
                        ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                    )}
                  >
                    ← Back
                  </button>
                  {currentStepIndex < visibleSteps.length - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!isStepValid(currentStep.id)}
                      className={classNames(
                        'inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-200',
                        !isStepValid(currentStep.id) ? 'opacity-60 cursor-not-allowed' : ''
                      )}
                    >
                      Next step
                      <span aria-hidden="true">→</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!isStepValid(currentStep.id)}
                      className={classNames(
                        'inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-200',
                        !isStepValid(currentStep.id) ? 'opacity-60 cursor-not-allowed' : ''
                      )}
                    >
                      {submitted ? 'Invite sent' : 'Send my onboarding link'}
                      <span aria-hidden="true">→</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-50 to-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-blue-100 text-xl">💡</div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">What to expect</div>
                      <div className="text-xs text-neutral-600">
                        Big, tappable cards on each screen. We’ll adjust steps if you do or don’t share your Tesla.
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {['Quick 1:1 questions', 'Adaptive rideshare steps', 'Mobile-first layout', 'Keeps your existing submit'].map((item) => (
                      <div key={item} className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-white/90 p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">🧭</span>
                    Wizard steps
                  </div>
                  <ul className="mt-3 space-y-2 text-xs text-neutral-600">
                    {visibleSteps.map((step, idx) => (
                      <li key={step.id} className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-700">
                          {idx + 1}
                        </span>
                        <div className="font-semibold text-neutral-900">{step.title}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </CardShell>
      </div>
    );
  }

  function SectionTitle({ title, subtitle }) {
    return (
      <div className="mb-5 max-w-3xl">
        <h2
          className="font-bold"
          style={{ fontSize: 'clamp(1.125rem, 1.2vw + .75rem, 1.5rem)', letterSpacing: '0.1px', lineHeight: 1.35 }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm opacity-80 leading-relaxed" style={{ lineHeight: 1.5 }}>
            {subtitle}
          </p>
        ) : null}
      </div>
    );
  }

  function TeslaConnectCard({
    accent,
    isDark,
    telemetrySource,
    authState,
    authError,
    deviceAuth,
    lastSynced,
    isLoadingTelemetry,
    isPolling,
    onStartLogin,
    onReset,
    onRefresh,
    className = '',
  }) {
    const isConnected = authState?.status === 'connected' && telemetrySource === 'tesla';
    return (
      <Card
        className={classNames(
          'border p-4 md:p-5',
          className,
          isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'
        )}
      >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.25em] opacity-70">Tesla account</div>
            <div className="font-semibold text-lg">Premium, Secure & Owner-Centric</div>
            <p className="text-sm opacity-80 max-w-2xl">
              TeslaHelper is built with a security-first mindset and a focus on real Tesla owners. We use secure authentication,
              respect your privacy, and design every feature to feel like a natural extension of your car—not another clunky tool.
            </p>
            <div className="flex flex-wrap gap-2 text-xs opacity-80">
              <span
                className={classNames(
                  'rounded-full px-3 py-1 font-semibold',
                  telemetrySource === 'tesla'
                    ? 'bg-emerald-500/20 text-emerald-500'
                    : isDark
                      ? 'bg-neutral-800 text-white'
                      : 'bg-neutral-100 text-neutral-800'
                )}
              >
                {telemetrySource === 'tesla' ? 'Live from Tesla Fleet API' : 'Waiting for Tesla sign-in'}
              </span>
              {lastSynced ? <span>Last synced {new Date(lastSynced).toLocaleString()}</span> : null}
              {isLoadingTelemetry ? <span>Refreshing…</span> : null}
              {isPolling ? <span>Waiting for approval…</span> : null}
            </div>
            {authError ? (
              <div
                className={classNames(
                  'rounded-lg border px-3 py-2 text-sm',
                  isDark ? 'border-amber-500/50 text-amber-200 bg-amber-500/10' : 'border-amber-400 text-amber-700 bg-amber-50'
                )}
              >
                {authError}
              </div>
            ) : null}
            {deviceAuth ? (
              <div
                className={classNames(
                  'grid gap-2 rounded-lg border p-3 text-sm sm:grid-cols-[auto,1fr] sm:items-center',
                  isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-neutral-200 bg-neutral-50'
                )}
              >
                <div className="font-mono text-lg font-semibold" aria-label="Tesla verification code">
                  {deviceAuth.userCode}
                </div>
                <div className="space-y-1">
                  <div className="font-semibold">Approve the login with Tesla</div>
                  <p className="opacity-80">
                    Open
                    <a className="ml-1 underline" href={deviceAuth.verificationUri} target="_blank" rel="noreferrer">
                      {deviceAuth.verificationUri}
                    </a>
                    , then enter the code shown here. We’ll update the dashboard as soon as Tesla confirms.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <Button
                    as="a"
                    href={deviceAuth.verificationUri}
                    target="_blank"
                    rel="noreferrer"
                    variant="primary"
                    accent={accent}
                    isDark={isDark}
                    className="w-full sm:w-auto"
                  >
                    Open Tesla login
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-72">
            <Button
              onClick={isConnected ? onRefresh : onStartLogin}
              accent={accent}
              isDark={isDark}
              disabled={isLoadingTelemetry || isPolling}
            >
              {isConnected
                ? isLoadingTelemetry
                  ? 'Refreshing…'
                  : 'Refresh telemetry'
                : deviceAuth
                  ? 'Awaiting approval…'
                  : 'Connect Tesla account'}
            </Button>
            <Button variant="secondary" isDark={isDark} onClick={onReset} disabled={isPolling}>
              {isConnected ? 'Disconnect Tesla' : 'Browse without signing in'}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  /* ------------------------------------------------------------------
   * Telemetry & analytics showcase components
   *
   * These cards visualize how telemetry, FSD, safety, and achievements
   * will surface in the UI once backend data is connected.
   * ------------------------------------------------------------------ */
  function AnalyticsMetricCard({ label, value, helper, accent, isDark }) {
    return (
      <Card
        className={classNames(
          'border p-4 h-full',
          isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'
        )}
      >
        <div className="text-xs uppercase tracking-[0.25em] opacity-70">{label}</div>
        <div className="mt-2 text-2xl font-bold leading-tight">{value}</div>
        {helper ? <div className="mt-1 text-sm opacity-80">{helper}</div> : null}
        <div className={classNames('mt-3 h-1 rounded-full', accent.underline)} aria-hidden="true" />
      </Card>
    );
  }

  function ProgressBar({ value, max, label, isDark }) {
    const pct = Math.min(100, Math.round((value / max) * 100));
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span>{label}</span>
          <span className="opacity-70">{pct}%</span>
        </div>
        <div className={classNames('h-2 rounded-full', isDark ? 'bg-neutral-800' : 'bg-neutral-200')} role="presentation">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${pct}%` }}
            aria-hidden="true"
          />
        </div>
      </div>
    );
  }

  function TripAnalyticsCard({ trip, isDark, accent }) {
    return (
      <Card
        className={classNames(
          'border p-4 flex flex-col gap-3',
          isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold leading-tight">{trip.name}</div>
            <div className="text-xs opacity-70">{trip.date}</div>
          </div>
          <div className={classNames('text-xs font-semibold px-2 py-1 rounded-full', accent.btn, 'text-white')}>
            {trip.autopilotPct}% on AP
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <div className="text-xs uppercase opacity-70">Distance</div>
            <div className="font-semibold">{trip.distance.toFixed(1)} mi</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase opacity-70">Duration</div>
            <div className="font-semibold">{trip.duration}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase opacity-70">Efficiency</div>
            <div className="font-semibold">{trip.efficiency} Wh/mi</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase opacity-70">SoC change</div>
            <div className="font-semibold">
              {trip.startSoc}% → {trip.endSoc}% ({trip.startSoc - trip.endSoc}% drop)
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {trip.events.map((ev) => (
            <span
              key={ev}
              className={classNames(
                'inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold',
                isDark ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-800'
              )}
            >
              <span aria-hidden="true">⚠️</span>
              {ev}
            </span>
          ))}
        </div>
      </Card>
    );
  }

  function FsdWeeklyChart({ weeklyMiles, isDark }) {
    const maxMiles = Math.max(...weeklyMiles.map((d) => d.miles));
    return (
      <div className="flex items-end gap-2" aria-label="Autopilot miles this week">
        {weeklyMiles.map((d) => {
          const height = (d.miles / maxMiles) * 100;
          return (
            <div key={d.label} className="flex flex-col items-center gap-2 text-xs">
              <div
                className={classNames('w-9 rounded-md bg-blue-500/80', isDark ? 'bg-blue-500/80' : 'bg-blue-500/70')}
                style={{ height: `${height}%`, minHeight: '32px' }}
                aria-hidden="true"
              />
              <span className="opacity-80">{d.label}</span>
              <span className="font-semibold">{d.miles} mi</span>
            </div>
          );
        })}
      </div>
    );
  }

  function TelemetryAnalyticsSection({
    accent,
    isDark,
    sectionId = 'analytics',
    title,
    subtitle,
    data = ANALYTICS_MOCK,
    telemetrySource,
    lastSynced,
    isLoadingTelemetry,
    onRefresh,
  }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const disclosureId = useId();
    const { summary, trips, fsd, safety, achievements } = data || ANALYTICS_MOCK;
    return (
      <section id={sectionId} className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionTitle
            title={title || 'Telemetry, FSD, and safety analytics'}
            subtitle={
              subtitle ||
              'Preview the dashboard experience powered by Tesla Fleet telemetry: trip summaries, Autopilot usage, safety events, and achievements.'
            }
          />
          <div className="flex sm:flex-col items-start gap-2 sm:items-end" aria-label="Telemetry controls">
            <Button
              variant="secondary"
              size="sm"
              isDark={isDark}
              onClick={() => setIsExpanded((open) => !open)}
              aria-expanded={isExpanded}
              aria-controls={`${disclosureId}-content`}
            >
              {isExpanded ? 'Hide telemetry' : 'Show telemetry'}
            </Button>
            <div className="flex flex-wrap gap-2 text-xs opacity-80">
              {!isExpanded && <span>Collapsed by default</span>}
              {telemetrySource ? (
                <span
                  className={classNames(
                    'rounded-full px-2 py-1 font-semibold',
                    telemetrySource === 'tesla'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : isDark
                        ? 'bg-neutral-800 text-white'
                        : 'bg-neutral-100 text-neutral-800'
                  )}
                >
                  {telemetrySource === 'tesla' ? 'Live Tesla data' : 'Demo data'}
                </span>
              ) : null}
              {lastSynced ? <span>Synced {new Date(lastSynced).toLocaleString()}</span> : null}
              {isLoadingTelemetry ? <span>Refreshing…</span> : null}
              {typeof onRefresh === 'function' ? (
                <button
                  type="button"
                  className={classNames(
                    'underline underline-offset-4 hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
                    isDark ? 'text-white' : 'text-neutral-800'
                  )}
                  onClick={() => onRefresh()}
                >
                  Refresh now
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div id={`${disclosureId}-content`} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <AnalyticsMetricCard
                label="Total miles"
                value={`${summary.totalMiles.toLocaleString()} mi`}
                helper={`${summary.autopilotPct}% on Autopilot`}
                accent={accent}
                isDark={isDark}
              />
              <AnalyticsMetricCard
                label="Avg efficiency"
                value={`${summary.avgEfficiency} Wh/mi`}
                helper="Net energy incl. regen"
                accent={accent}
                isDark={isDark}
              />
              <AnalyticsMetricCard
                label="Autopilot miles"
                value={`${summary.autopilotMiles.toLocaleString()} mi`}
                helper={`${summary.autopilotPct}% of driving`}
                accent={accent}
                isDark={isDark}
              />
              <AnalyticsMetricCard
                label="Safety score"
                value={`${summary.safetyScore}/100`}
                helper="Weighted by hard braking, turns, speeding"
                accent={accent}
                isDark={isDark}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <Card className={classNames('border p-4', isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200')}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.25em] opacity-70">Recent trips</div>
                      <div className="font-semibold">Trip distance, efficiency, Autopilot, and safety events</div>
                    </div>
                    <Button as="a" href="#" variant="secondary" size="sm" isDark={isDark}>
                      Open trip detail
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {trips.map((trip) => (
                      <TripAnalyticsCard key={trip.id} trip={trip} isDark={isDark} accent={accent} />
                    ))}
                  </div>
                </Card>
              </div>

              <Card className={classNames('border p-4 space-y-4', isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200')}>
                <div className="text-xs uppercase tracking-[0.25em] opacity-70">Autopilot week</div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-80">Miles per disengagement</div>
                    <div className="text-2xl font-bold leading-tight">{fsd.milesPerDisengagement} mi</div>
                  </div>
                  <div className="text-right text-sm opacity-80">
                    <div>{fsd.disengagements} disengagements</div>
                    <div>{fsd.longestSession} mi longest session</div>
                  </div>
                </div>
                <FsdWeeklyChart weeklyMiles={fsd.weeklyMiles} isDark={isDark} />
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className={classNames('border p-4 space-y-3', isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200')}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] opacity-70">Safety events</div>
                    <div className="font-semibold">Hard braking, acceleration, turns, speeding</div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-400">
                    Real-time from telemetry
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs uppercase opacity-70">Hard brakes</div>
                    <div className="text-xl font-bold">{safety.events.hardBrakes}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase opacity-70">Rapid accel</div>
                    <div className="text-xl font-bold">{safety.events.rapidAccel}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase opacity-70">Aggressive turns</div>
                    <div className="text-xl font-bold">{safety.events.aggressiveTurns}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase opacity-70">Speeding</div>
                    <div className="text-xl font-bold">{safety.events.speeding}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {safety.recentAlerts.map((alert) => (
                    <div
                      key={alert}
                      className={classNames(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                        isDark ? 'bg-neutral-800' : 'bg-neutral-100'
                      )}
                    >
                      <span aria-hidden="true">🚨</span>
                      <span className="font-semibold">{alert}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className={classNames('border p-4 space-y-3', isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200')}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] opacity-70">Achievements</div>
                    <div className="font-semibold">Badges tracked across trips</div>
                  </div>
                  <span className="text-2xl" aria-hidden="true">✨</span>
                </div>
                <div className="space-y-3">
                  {achievements.map((a) => (
                    <div key={a.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{a.label}</span>
                        <span className="opacity-70">
                          {a.current} / {a.target}
                        </span>
                      </div>
                      <div className="text-xs opacity-70">{a.desc}</div>
                      <ProgressBar value={a.current} max={a.target} label="Progress" isDark={isDark} />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className={classNames('border p-4 space-y-3', isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white border-neutral-200')}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.25em] opacity-70">Trip detail preview</div>
                    <div className="font-semibold">Route, AP segments, energy, events</div>
                  </div>
                  <Button as="a" href="#library" variant="ghost" size="sm" isDark={isDark}>
                    View library
                  </Button>
                </div>
                <div
                  className={classNames(
                    'aspect-[4/3] w-full rounded-xl border bg-gradient-to-br from-blue-500/40 via-emerald-500/30 to-violet-500/30',
                    isDark ? 'border-neutral-800' : 'border-neutral-200'
                  )}
                  aria-hidden="true"
                />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs uppercase opacity-70">Energy used</div>
                    <div className="font-semibold">12.4 kWh (regen 2.1 kWh)</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase opacity-70">Max speed</div>
                    <div className="font-semibold">72 mph</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase opacity-70">Autopilot</div>
                    <div className="font-semibold">62% of trip</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase opacity-70">Disengagements</div>
                    <div className="font-semibold">1 manual, 0 system</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </section>
    );
  }

  /* ------------------------------------------------------------------
   * Car tile component
   *
   * Displays a car image with a button that scrolls to the library
   * filtered for the given model. The accent colours are passed in.
   * ------------------------------------------------------------------ */
  function CarTile({ id, accent, carImages, isDark }) {
    const m = CAR_META[id];
    // Use base64 image if available, otherwise fall back to the img field or an empty string.
    const imgSrc = (carImages && carImages[id]) || m.img || '';
    return (
      <Card className="bg-neutral-900/70 border border-neutral-800 overflow-hidden">
        <div className="p-4">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl">
            <img src={imgSrc} alt={m.alt} className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="mt-3 flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold">{m.label}</div>
              <div className="text-xs opacity-70">{m.note}</div>
            </div>
            <Button
              as="a"
              href={'#library?model=' + encodeURIComponent(m.label)}
              variant="primary"
              size="md"
              accent={accent}
              isDark={isDark}
            >
              Open library
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  /* ------------------------------------------------------------------
   * Cars grid component
   *
   * Displays all four models in a responsive grid.
   * ------------------------------------------------------------------ */
  function CarsGrid({ accent, carImages, isDark }) {
    const ids = ['model3', 'models', 'modelx', 'modely', 'cybertruck'];
    return (
      <section id="models" className="mx-auto max-w-6xl px-4 pb-16">
        <SectionTitle
          title="The Ultimate Companion for Tesla Owners"
          subtitle="TeslaHelper is a premium all-in-one web app that empowers Tesla owners to get more from their vehicles. Designed by Tesla enthusiasts for Tesla enthusiasts, it combines all the essentials of the official Tesla app with powerful new features that make ownership easier and more fun. Enjoy a friendly, tech-savvy experience that puts you in full control of your Tesla—anytime, anywhere."
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {ids.map((id) => (
          <CarTile key={id} id={id} accent={accent} carImages={carImages} isDark={isDark} />
        ))}
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------------
   * Video row component
   *
   * Renders a single video entry with a watch link.
   * ------------------------------------------------------------------ */
  function VideoRow({ v }) {
    return (
      <div className="flex items-start justify-between gap-3 py-2">
        <div>
          <div className="font-medium">{v.title}</div>
          <div className="text-sm opacity-80">{v.copy}</div>
        </div>
        <a href={v.url} target="_blank" rel="noreferrer" className="text-sm underline hover:opacity-90 shrink-0">
          Watch
        </a>
      </div>
    );
  }

  /* ------------------------------------------------------------------
   * Category accordion component
   *
   * Each accordion holds a collection of videos. Clicking the header
   * toggles the open state. We pass ``isDark`` down to compute borders.
   * ------------------------------------------------------------------ */
  function CategoryAccordion({ cat, isDark }) {
    const [open, setOpen] = useState(false);
    const disclosureId = useId();
    const borderSoft = isDark ? 'border-neutral-800' : 'border-neutral-200';
    const cardBg = isDark ? 'bg-neutral-900' : 'bg-neutral-50';
    return (
      <Card className={classNames(cardBg, 'border', borderSoft)}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`${disclosureId}-content`}
          className="w-full text-left p-4 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {cat.name}
        </button>
        {open && (
          <div id={`${disclosureId}-content`} role="region" aria-label={cat.name} className="px-4 pb-3">
            {cat.videos.map((v, i) => (
              <React.Fragment key={v.title + i}>
                <VideoRow v={v} />
                {i < cat.videos.length - 1 ? <hr className={classNames('my-2', borderSoft)} /> : null}
              </React.Fragment>
            ))}
          </div>
        )}
      </Card>
    );
  }

  /* ------------------------------------------------------------------
   * Library panel component
   *
   * Provides search and filtering over the video library. It fetches
   * ``tesla_howto_library.json`` at runtime. Filters for model and
   * year, as well as a full‑text search across titles and copy.
   * ------------------------------------------------------------------ */
  function LibraryPanel({ accent, isDark }) {
    const [lib, setLib] = useState(null);
    const [modelFilter, setModelFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [q, setQ] = useState('');
    const [searchIndex, setSearchIndex] = useState(null);

    const applyHashFilters = React.useCallback(() => {
      try {
        const hash = window.location.hash || '';
        if (hash.startsWith('#library')) {
          const params = new URLSearchParams(hash.replace(/^#library\??/, ''));
          setQ(params.get('q') || '');
          setModelFilter(params.get('model') || '');
        }
      } catch (e) {
        // ignore URL parsing errors
      }
    }, []);

    useEffect(() => {
      applyHashFilters();
      fetch('tesla_howto_library.json')
        .then((r) => r.json())
        .then((json) => {
          const modelsWithIds = (json.models || []).map((m, modelIdx) => ({
            ...m,
            categories: (m.categories || []).map((cat, catIdx) => ({
              ...cat,
              videos: (cat.videos || []).map((v, vidIdx) => ({
                ...v,
                _searchId: `${modelIdx}-${catIdx}-${vidIdx}-${v.title}`,
              })),
            })),
          }));
          setLib({ ...json, models: modelsWithIds });
          if (typeof FlexSearch !== 'undefined') {
            const index = new FlexSearch.Document({
              tokenize: 'forward',
              document: { id: 'id', index: ['title', 'copy', 'model', 'category', 'year'] },
            });
            modelsWithIds.forEach((model) => {
              (model.categories || []).forEach((cat) => {
                (cat.videos || []).forEach((v) => {
                  const payload = {
                    id: v._searchId,
                    title: v.title,
                    copy: v.copy,
                    model: model.model,
                    category: cat.name,
                    year: model.year_range || '',
                  };
                  index.add(payload);
                });
              });
            });
            setSearchIndex(index);
          }
        })
        .catch(() => setLib(null));
    }, [applyHashFilters]);

    useEffect(() => {
      const handleHashChange = () => applyHashFilters();
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }, [applyHashFilters]);

    const models = lib?.models || [];
    // Filter by selected model/year
    const filteredModels = useMemo(() => {
      let ms = models;
      if (modelFilter) {
        ms = ms.filter((m) => m.model.toLowerCase().includes(modelFilter.toLowerCase()));
      }
      if (yearFilter) {
        ms = ms.filter((m) => (m.year_range || '').includes(yearFilter));
      }
      return ms;
    }, [models, modelFilter, yearFilter]);

    const searchTerms = useMemo(() => expandSearchTerms(q), [q]);
    const searchHits = useMemo(() => {
      if (!searchIndex || searchTerms.length === 0) return null;
      const ids = new Set();
      searchTerms.forEach((term) => {
        const res = searchIndex.search(term, { enrich: true }) || [];
        res.forEach((group) => {
          group.result.forEach((id) => ids.add(id));
        });
      });
      return ids;
    }, [searchIndex, searchTerms]);

    function textContainsAny(str) {
      return searchTerms.some((term) => str.includes(term));
    }

    function videoMatches(video) {
      if (searchTerms.length === 0) return true;
      if (searchHits && video._searchId) return searchHits.has(video._searchId);
      const lowerTitle = (video.title || '').toLowerCase();
      const lowerCopy = (video.copy || '').toLowerCase();
      return textContainsAny(lowerTitle) || textContainsAny(lowerCopy);
    }

    function catMatches(cat) {
      if (searchTerms.length === 0) return true;
      if (textContainsAny(cat.name.toLowerCase())) return true;
      return cat.videos.some(videoMatches);
    }

    const borderSoft = isDark ? 'border-neutral-800' : 'border-neutral-200';
    const cardBg = isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200';

    return (
      <section id="library" className="mx-auto max-w-6xl px-4 pb-24">
        <SectionTitle
          title="Personalize Your Tesla Experience"
          subtitle="Your Tesla is unique—your app experience should be too. TeslaHelper lets you customize climate and charging schedules, tailor notifications, and pin your favorite controls so you always see what matters most at a glance."
        />
        <Card className={classNames('p-4 border', cardBg, borderSoft)}>
          <div className="grid md:grid-cols-4 gap-3">
            <input
              placeholder="Search videos (e.g., charging, sentry, FSD)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={classNames(
                'w-full rounded-lg px-3 py-2 text-sm border focus:outline-none focus:ring-2',
                isDark ? 'bg-neutral-950 border-neutral-800 focus:ring-violet-500' : 'bg-white border-neutral-300 focus:ring-violet-500'
              )}
            />
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className={classNames(
                'w-full rounded-lg px-3 py-2 text-sm border',
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-300'
              )}
            >
              <option value="">All models</option>
              {Array.from(new Set(models.map((m) => m.model))).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className={classNames(
                'w-full rounded-lg px-3 py-2 text-sm border',
                isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-300'
              )}
            >
              <option value="">All years</option>
              {Array.from(new Set(models.map((m) => m.year_range).filter(Boolean))).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <Button
              as="a"
              href="#models"
              variant="primary"
              size="md"
              accent={ACCENTS.violet}
              isDark={isDark}
              className="text-center"
            >
              Back to Models
            </Button>
          </div>
        </Card>
        <div className="mt-4 space-y-6">
          {filteredModels.length === 0 && (
            <div className="text-sm opacity-80">No results. Try clearing filters.</div>
          )}
          {filteredModels.map((m, idx) => {
            const cats = (m.categories || []).filter(catMatches);
            if (cats.length === 0) return null;
            return (
              <div key={m.model + (m.year_range || '') + idx}>
                <div className="mb-2">
                  <div className="text-sm opacity-70 uppercase tracking-widest">
                    {m.model}
                    {m.year_range ? ' · ' + m.year_range : ''}
                  </div>
                  <div className={classNames('h-1 rounded-full w-20 mt-2', accent.underline)} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {cats.map((c, i) => (
                    <CategoryAccordion key={c.name + i} cat={c} isDark={isDark} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------------
   * Main Tesla helper application component
   *
   * Orchestrates the accent, colour mode (dark/light) and renders
   * the header, hero, car grid, and library panel.
   * ------------------------------------------------------------------ */
  function TeslaHelperApp() {
    const [mode, setMode] = useState(() => {
      if (typeof window === 'undefined') return 'dark';
      const stored = window.localStorage?.getItem('teslahelper-theme');
      if (stored === 'light' || stored === 'dark') return stored;
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
      return prefersDark ? 'dark' : 'light';
    });
    const [reduceMotion, setReduceMotion] = useState(false);
    const [headerCompact, setHeaderCompact] = useState(false);
    const [headerSearch, setHeaderSearch] = useState('');
    const [navMenuOpen, setNavMenuOpen] = useState(false);
    const navMenuRef = useRef(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [showTeslaModal, setShowTeslaModal] = useState(false);
    const accent = useMemo(() => ACCENTS[BRAND.defaultAccent] || ACCENTS.violet, []);
    const isDark = mode === 'dark';
    const pageBg = isDark ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-900';
    const headerBg = isDark ? 'bg-neutral-900/95 border-neutral-800' : 'bg-white/95 border-neutral-200';
    const {
      telemetryData,
      telemetrySource,
      authState,
      authError,
      deviceAuth,
      startDeviceLogin,
      resetToDemo,
      isLoadingTelemetry,
      isPolling,
      lastSynced,
      refreshTelemetry,
    } = useTeslaTelemetry();

    // Car images are loaded lazily from tesla_helper_base64_1280.json. The keys in
    // the JSON map correspond to model names (model3, models, modelx, modely, cybertruck).
    const [carImages, setCarImages] = useState({});
    useEffect(() => {
      fetch('tesla_helper_base64_1280.json')
        .then((r) => r.json())
        .then((data) => {
          setCarImages(data || {});
        })
        .catch(() => {
          // silently ignore errors; blank images will remain
        });
    }, []);
    useEffect(() => {
      document.documentElement.style.setProperty('--safe-top', 'env(safe-area-inset-top)');
      document.documentElement.style.setProperty('--safe-bottom', 'env(safe-area-inset-bottom)');
      const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      if (motionQuery) {
        const handleMotion = (e) => setReduceMotion(e.matches);
        setReduceMotion(motionQuery.matches);
        motionQuery.addEventListener('change', handleMotion);
        return () => motionQuery.removeEventListener('change', handleMotion);
      }
      return undefined;
    }, []);
    useEffect(() => {
      if (typeof document !== 'undefined') {
        document.body.dataset.theme = mode;
      }
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem('teslahelper-theme', mode);
      }
    }, [mode]);
    useEffect(() => {
      const onScroll = () => setHeaderCompact(window.scrollY > 12);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    }, []);
    useEffect(() => {
      function handleClickAway(e) {
        if (navMenuRef.current && !navMenuRef.current.contains(e.target)) {
          setNavMenuOpen(false);
        }
      }
      if (navMenuOpen) {
        document.addEventListener('mousedown', handleClickAway);
        document.addEventListener('touchstart', handleClickAway);
        document.addEventListener('keydown', handleEscape, true);
      }
      function handleEscape(e) {
        if (e.key === 'Escape') {
          setNavMenuOpen(false);
        }
      }
      return () => {
        document.removeEventListener('mousedown', handleClickAway);
        document.removeEventListener('touchstart', handleClickAway);
        document.removeEventListener('keydown', handleEscape, true);
      };
    }, [navMenuOpen]);
    useEffect(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    }, []);
    useEffect(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      }
    }, []);
    useEffect(() => {
      const handleAnchorClick = (event) => {
        if (typeof document === 'undefined') return;
        const anchor = event.target?.closest?.('a[href^="#"]');
        if (!anchor) return;
        const href = anchor.getAttribute('href');
        if (!href || href === '#' || href === '#!') return;
        const [idPart] = href.split('?');
        if (!idPart || idPart.length < 2) return;
        const target = document.querySelector(idPart);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (typeof window !== 'undefined') {
          if (window.history?.pushState) {
            window.history.pushState(null, '', href);
          } else {
            window.location.hash = href;
          }
          try {
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          } catch (err) {
            const fallbackEvent = document.createEvent('HTMLEvents');
            fallbackEvent.initEvent('hashchange', true, true);
            window.dispatchEvent(fallbackEvent);
          }
        }
      };
      document.addEventListener('click', handleAnchorClick);
      return () => document.removeEventListener('click', handleAnchorClick);
    }, []);

    useEffect(() => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#library')) {
        const params = new URLSearchParams(hash.replace(/^#library\??/, ''));
        setHeaderSearch(params.get('q') || '');
      }
      const handleHashChange = () => {
        const nextHash = window.location.hash || '';
        if (nextHash.startsWith('#library')) {
          const params = new URLSearchParams(nextHash.replace(/^#library\??/, ''));
          setHeaderSearch(params.get('q') || '');
        }
      };
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const headerStyle = reduceMotion ? {} : { transition: 'background-color 120ms ease' };
    const handleSearchSubmit = (e) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (headerSearch.trim()) params.set('q', headerSearch.trim());
      const hash = params.toString() ? `#library?${params.toString()}` : '#library';
      window.location.hash = hash;
    };
    const exploreMenuItems = [
      { href: '/', label: 'Homepage' },
      { href: '#library', label: 'Open Library' },
      {
        href: '#my-tesla',
        label: 'Connect Tesla account',
        onClick: () => setShowTeslaModal(true),
      },
      { href: '#my-tesla', label: 'My Tesla' },
      { href: '/start', label: 'Start' },
      { href: '/kit', label: 'Kit' },
      { href: '/upsell', label: 'Upsell' },
      { href: '/accessories/model-y', label: 'Accessories' },
      { href: '/chargers', label: 'Chargers' },
      { href: '/insurance', label: 'Insurance' },
      { href: '/disclosure', label: 'Disclosure' },
      { href: '/thank-you', label: 'Thank you' },
    ];
    const navTabs = [
      { href: '#top', label: 'Home' },
      { href: '#library', label: 'Library' },
      { href: '#models', label: 'Models' },
      { href: '#my-tesla', label: 'My Tesla' },
      { href: '/start', label: 'Start' },
      { href: '/accessories/model-y', label: 'Accessories' },
    ];

    return (
      <div id="top" className={classNames('min-h-screen', pageBg)}>
        <header
          className={classNames(
            'sticky top-0 z-40 backdrop-blur border-b shadow-[0_1px_0_rgba(255,255,255,0.04)]',
            headerBg
          )}
          style={headerStyle}
        >
          <div
            className={classNames(
              'mx-auto max-w-6xl px-4 flex flex-col transition-[gap] duration-150',
              headerCompact ? 'gap-2 py-2' : 'gap-3 py-3'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative" ref={navMenuRef}>
                <button
                  type="button"
                  className={classNames(
                    'inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition',
                    isDark
                      ? 'border-white/10 bg-white/5 text-white hover:border-white/30'
                      : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400'
                  )}
                  aria-haspopup="menu"
                  aria-expanded={navMenuOpen}
                  aria-controls="main-nav-explore-menu"
                  onClick={() => setNavMenuOpen((open) => !open)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setNavMenuOpen(false);
                      e.currentTarget.focus();
                    }
                  }}
                >
                  <span className="sr-only">Toggle navigation</span>
                  <div className="flex flex-col justify-center space-y-1" aria-hidden="true">
                    <span className="block h-0.5 w-5 rounded-full bg-current" />
                    <span className="block h-0.5 w-4 rounded-full bg-current" />
                    <span className="block h-0.5 w-5 rounded-full bg-current" />
                  </div>
                </button>
                {navMenuOpen && (
                  <div
                    id="main-nav-explore-menu"
                    className={classNames(
                      'absolute left-0 mt-2 w-52 max-w-[calc(100vw-2rem)] rounded-xl border shadow-lg ring-1',
                      isDark
                        ? 'border-white/10 bg-neutral-900/95 text-white ring-black/30'
                        : 'border-neutral-200 bg-white text-neutral-900 ring-black/5'
                    )}
                    role="menu"
                  >
                    <ul className="py-2">
                      {exploreMenuItems.map((item) => (
                        <li key={item.href}>
                          <a
                            className={classNames(
                              'block px-4 py-2 text-sm focus:outline-none',
                              isDark ? 'hover:bg-white/10 focus:bg-white/10' : 'hover:bg-neutral-100 focus:bg-neutral-100'
                            )}
                            href={item.href}
                            target={item.target}
                            rel={item.rel}
                            role="menuitem"
                            onClick={(e) => {
                              if (item.onClick) {
                                e.preventDefault();
                                item.onClick();
                              }
                              setNavMenuOpen(false);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                setNavMenuOpen(false);
                                navMenuRef.current?.querySelector('button')?.focus();
                              }
                            }}
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex flex-1 items-center gap-2 min-w-0">
                <a
                  href="https://teslahelper.app"
                  className="inline-flex items-center justify-center md:justify-start"
                  aria-label={BRAND.name}
                >
                  <BrandWordmark compact={headerCompact} />
                  <span className="sr-only">{BRAND.name}</span>
                </a>
                <Button
                  onClick={() => setShowTeslaModal(true)}
                  variant="secondary"
                  size={headerCompact ? 'xs' : 'sm'}
                  className="rounded-full whitespace-nowrap"
                  isDark={isDark}
                >
                  Connect
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-pressed={isDark}
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  onClick={() => setMode(isDark ? 'light' : 'dark')}
                  isDark={isDark}
                  className={classNames('rounded-full', headerCompact ? 'h-8 w-8 text-sm' : '')}
                >
                  {isDark ? '🌞' : '🌙'}
                </Button>
                <Button
                  as="a"
                  href="#library"
                  variant="primary"
                  size={headerCompact ? 'xs' : 'sm'}
                  accent={accent}
                  isDark={isDark}
                  className="hidden md:inline-flex rounded-full"
                >
                  Open Library
                </Button>
                <Button
                  as="a"
                  href={SUPPORT_LINK}
                  target="_blank"
                  rel="noreferrer"
                  variant="ghost"
                  size={headerCompact ? 'xs' : 'sm'}
                  isDark={isDark}
                  className="rounded-full"
                >
                  Contribute
                </Button>
              </div>
            </div>
            <form
              className={classNames('flex w-full items-center', headerCompact ? 'gap-2' : 'gap-3')}
              role="search"
              onSubmit={handleSearchSubmit}
            >
              <label className="sr-only" htmlFor="global-search">
                Search the Tesla Helper library
              </label>
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true">
                  🔍
                </span>
                <input
                  id="global-search"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search for news or Tesla tips"
                  className={classNames(
                    'w-full rounded-full pl-11 pr-4 text-sm border focus:outline-none focus:ring-2 shadow-inner',
                    headerCompact ? 'h-10' : 'h-11',
                    isDark
                      ? 'bg-neutral-900/90 border-white/10 text-white focus:ring-emerald-400/80 focus:border-emerald-400/80'
                      : 'bg-white border-neutral-300 text-neutral-900 focus:ring-emerald-500/70 focus:border-emerald-500/70'
                  )}
                />
              </div>
              <Button
                variant="primary"
                size={headerCompact ? 'xs' : 'sm'}
                type="submit"
                accent={accent}
                isDark={isDark}
                className="hidden md:inline-flex rounded-full px-4"
              >
                Search
              </Button>
            </form>
            <nav className="flex items-center overflow-x-auto pt-1" aria-label="Primary">
              <ul className="flex items-center gap-3 text-sm font-semibold">
                {navTabs.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className={classNames(
                        'inline-flex items-center gap-1 rounded-full transition',
                        headerCompact ? 'px-2.5 py-1.5 text-[13px]' : 'px-3 py-2',
                        isDark
                          ? 'text-white/80 hover:text-white hover:bg-white/10'
                          : 'text-neutral-800 hover:text-black hover:bg-neutral-100',
                        accent.hover
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className={classNames('h-[3px] w-full rounded-full', accent.underline)} />
          </div>
        </header>
        {/* Hero / quick links */}
        <section className="relative overflow-hidden">
          <div
            className={classNames(
              'absolute inset-0 -z-10',
              isDark
                ? 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950'
                : 'bg-gradient-to-br from-violet-50 via-white to-white'
            )}
            aria-hidden="true"
          />
          <div className="absolute right-10 top-6 -z-10 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16 grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <p className="uppercase tracking-widest text-xs opacity-80">Tesla owners · Premium companion</p>
              <h1
                className="font-extrabold leading-tight"
                style={{ fontSize: 'clamp(1.5rem, 2vw + 1rem, 2.25rem)', letterSpacing: '0.1px', lineHeight: 1.3 }}
              >
                TeslaHelper: Elevate Your Tesla Experience
              </h1>
              <ul className="mt-2 space-y-2 text-sm opacity-90">
                <li className="flex items-start gap-2">
                  <span aria-hidden="true">•</span>
                  <span>
                    The premium companion app that gives you deeper insights, smarter controls, and more personalization for your
                    Tesla—without replacing the official app.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden="true">•</span>
                  <span>
                    Designed by Tesla enthusiasts for Tesla enthusiasts, it combines essentials from the official app with powerful
                    new features that make ownership easier and more fun.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span aria-hidden="true">•</span>
                  <span>
                    Control your Tesla from anywhere with a clean, fast interface. Lock or unlock, precondition the cabin,
                    check charge status, and manage multiple vehicles from one simple dashboard, so everyday tasks take just a
                    tap.
                  </span>
                </li>
              </ul>
              <div className="mt-6 flex gap-3 flex-wrap">
                <Button as="a" href="#onboarding" variant="primary" accent={accent} isDark={isDark}>
                  Get Started with TeslaHelper
                </Button>
                <Button onClick={() => setShowTeslaModal(true)} variant="secondary" isDark={isDark}>
                  See How It Works
                </Button>
                <Button onClick={() => setShowInstallModal(true)} variant="ghost" isDark={isDark}>
                  Start with TeslaHelper
                </Button>
              </div>
              <p className="mt-2 text-xs opacity-80">
                Ready to Upgrade Your Ride? Experience a smarter way to own your Tesla. Connect your vehicle, explore your drive
                data, and unlock more control in just a few clicks.
              </p>
            </div>
            <div className="relative w-full">
              {showOnboarding ? (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      isDark={isDark}
                      onClick={() => setShowOnboarding(false)}
                      className="rounded-full"
                    >
                      Hide account sign up
                    </Button>
                  </div>
                  <OnboardingWizard accent={accent} isDark={isDark} />
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button
                    variant="primary"
                    accent={accent}
                    isDark={isDark}
                    className="w-full rounded-2xl md:w-auto"
                    onClick={() => setShowOnboarding(true)}
                  >
                    Account sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-4">
            <div className={classNames('h-1 rounded-full w-24', accent.underline)} />
          </div>
        </section>
        <TelemetryAnalyticsSection
          sectionId="my-tesla"
          title="Drive Analytics & Insights"
          subtitle="Understand your Tesla like never before with in-depth analytics on every drive. TeslaHelper turns your driving data into actionable insights to help you drive smarter and more efficiently. See detailed trip reports, energy use, and efficiency trends over time so you can get the most out of every charge."
          accent={accent}
          isDark={isDark}
          data={telemetryData}
          telemetrySource={telemetrySource}
          lastSynced={lastSynced}
          isLoadingTelemetry={isLoadingTelemetry}
          onRefresh={refreshTelemetry}
        />
        <section className="mx-auto max-w-6xl px-4 pb-10" aria-label="Remote Control & Convenience">
          <Card className={classNames('border px-3 py-3 md:px-4 md:py-3', isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200')}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="font-semibold flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">⭐</span>
                Remote Control & Convenience
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 w-full md:w-auto">
                {[
                  { label: 'My Tesla', href: '#my-tesla', icon: '📊' },
                  { label: 'Models', href: '#models', icon: '🚗' },
                  { label: 'Video Library', href: '#library', icon: '🎞️' },
                  { label: 'Charging', href: '#library?q=charging', icon: '🔌' },
                  { label: 'Autopilot / FSD', href: '#library?q=autopilot', icon: '🧭' },
                  { label: 'Safety', href: '#library?q=sentry', icon: '🛡️' },
                ].map((q) => (
                  <a
                    key={q.label}
                    data-quicklink
                    href={q.href}
                    className={classNames(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold justify-center hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                      isDark ? 'bg-neutral-800 text-white' : 'bg-white text-black',
                      accent.hover
                    )}
                  >
                    <span aria-hidden="true">{q.icon}</span>
                    {q.label}
                  </a>
                ))}
              </div>
            </div>
          </Card>
        </section>
        {/* Models and library */}
        <CarsGrid accent={accent} carImages={carImages} isDark={isDark} />
        <LibraryPanel accent={accent} isDark={isDark} />
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <SectionTitle
            title="Beyond the Official Tesla App"
            subtitle="Think of TeslaHelper as the perfect complement to the official Tesla app. You still keep everything Tesla provides, but add richer analytics, smarter shortcuts, and owner-focused tools that fill in the gaps—so you open TeslaHelper first."
          />
          <div className="grid md:grid-cols-2 gap-4">
            {OFFICIAL_LINKS.map((link) => (
              <Card
                key={link.label}
                className={classNames(
                  'p-4 border',
                  isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{link.label}</div>
                    <p className="text-sm opacity-80 mt-1">{link.desc}</p>
                  </div>
                  <a
                    className={classNames('text-sm font-semibold hover:opacity-90', accent.btn, accent.hover, 'px-3 py-2 rounded-lg')}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </section>
        <footer className={classNames('border-t', isDark ? 'border-neutral-800' : 'border-neutral-200')}>
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm opacity-80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
            <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
              <div className="flex items-center gap-4">
                <a className="hover:opacity-100" href="#">Terms</a>
                <a className="hover:opacity-100" href="#">Privacy</a>
                <a className="hover:opacity-100" href="#">Accessibility</a>
                <a className="hover:opacity-100" href="https://www.tesla.com/legal/trademark-copyright" target="_blank" rel="noreferrer">
                  Tesla legal
                </a>
              </div>
              <div className="text-center text-xs md:text-left max-w-xl">
                Tesla Helper is an independent resource for Tesla owners. Not affiliated with or endorsed by Tesla, Inc. Always confirm details in your Owner’s Manual and Tesla Support pages.
              </div>
              <a
                href={SUPPORT_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-white shadow-lg shadow-red-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                style={{ background: 'linear-gradient(90deg, #ef4444, #f87171)' }}
              >
                <span aria-hidden="true">⚡</span> Support Us
              </a>
            </div>
          </div>
        </footer>
        {showTeslaModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Connect your Tesla account"
            onClick={() => setShowTeslaModal(false)}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div
              className="relative z-10 w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-black/70 text-white text-2xl font-bold shadow-lg hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Close"
                onClick={() => setShowTeslaModal(false)}
              >
                ×
              </button>
              <TeslaConnectCard
                accent={accent}
                isDark={isDark}
                telemetrySource={telemetrySource}
                authState={authState}
                authError={authError}
                deviceAuth={deviceAuth}
                lastSynced={lastSynced}
                isLoadingTelemetry={isLoadingTelemetry}
                isPolling={isPolling}
                onStartLogin={startDeviceLogin}
                onReset={resetToDemo}
                onRefresh={refreshTelemetry}
                className="w-full"
              />
            </div>
          </div>
        )}
        {showInstallModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Add Tesla Helper to your home screen"
            onClick={() => setShowInstallModal(false)}
          >
            <div className="absolute inset-0 bg-black/60" />
            <Card
              className={classNames(
                'relative z-10 max-w-lg w-full p-5 shadow-2xl',
                isDark ? 'bg-neutral-900/90 border border-neutral-800' : 'bg-white'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-3 right-3 text-lg opacity-80 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Close"
                onClick={() => setShowInstallModal(false)}
              >
                ×
              </button>
              <div className="flex items-start gap-3">
                <div className="text-3xl" aria-hidden="true">📲</div>
                <div>
                  <h3 className="font-semibold text-lg">Add Tesla Helper to your Home Screen</h3>
                  <p className="text-sm opacity-80 mt-1">Install the app for quick access and offline garage use.</p>
                  <ul className="mt-3 space-y-2 text-sm list-disc list-inside opacity-90">
                    <li>iOS (Safari): Share → Add to Home Screen.</li>
                    <li>Android/Chrome: ⋮ menu → Install app.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Mount the application once the page loads
  const rootEl = document.getElementById('root');
  if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(<TeslaHelperApp />);
    window.__TESLAHELPER_HYDRATED = true;
  }
})();
