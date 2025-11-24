/*
 * Marketing pages router for TeslaHelper
 * New landing, kit, upsell, accessories, chargers, insurance, and disclosure pages
 * built on top of the existing lightweight React runtime.
 */

(() => {
  const { useEffect, useMemo, useRef, useState } = React;

  const APP_ENV = window.APP_ENV || {};
  const STORAGE_KEYS = {
    utm: 'teslahelper_utm',
    ab: 'teslahelper_ab_variants',
  };

  const AB_CONFIG = {
    landingHeadline: ['v1', 'v2'],
    tripwirePrice: [19, 24],
  };

  const ROUTE_META = {
    '/start': {
      title: 'TeslaHelper · New Tesla? Get answers fast',
      description: 'Get charging, FSD (Supervised), and safety answers by model and year. Join the quick-start list.',
      og: '/og-start.png',
    },
    '/kit': {
      title: 'Tesla Owner Starter Kit — TeslaHelper',
      description: 'One-time offer with day-1 checklists, FSD (Supervised) basics, and printable cheatsheets.',
      og: '/og-kit.png',
    },
    '/upsell': {
      title: 'Home Charging Mini-Course — TeslaHelper',
      description: '30-minute video and rebate walkthrough for home charging setup, plus charger picks.',
      og: '/og-upsell.png',
    },
    '/chargers': {
      title: 'Tesla charger picks — TeslaHelper',
      description: 'Apartment vs garage charger chooser plus top budget, smart, and rugged picks.',
      og: '/og-upsell.png',
    },
    '/insurance': {
      title: 'Compare EV insurance — TeslaHelper',
      description: 'Insurify, Jerry, and Policygenius quick links with EV-friendly guidance.',
      og: '/og-start.png',
    },
    '/disclosure': {
      title: 'FTC + Tesla disclosure — TeslaHelper',
      description: 'Affiliate and non-affiliation notes for TeslaHelper.',
      og: '/og-start.png',
    },
    '/thank-you': {
      title: 'Thanks for your purchase — TeslaHelper',
      description: 'Confirmation with next steps and optional upsell.',
      og: '/og-kit.png',
    },
  };

  const EXPLORE_MENU_ITEMS = [
    { href: '/', label: 'Homepage' },
    { href: '/start', label: 'Start' },
    { href: '/kit', label: 'Kit' },
    { href: '/upsell', label: 'Upsell' },
    { href: '/accessories/model-y', label: 'Accessories' },
    { href: '/chargers', label: 'Chargers' },
    { href: '/insurance', label: 'Insurance' },
    { href: '/disclosure', label: 'Disclosure' },
    { href: '/thank-you', label: 'Thank you' },
  ];

  const ACCENTS = {
    violet: { btn: 'bg-violet-500', hover: 'hover:bg-violet-600', underline: 'bg-violet-500' },
    emerald: { btn: 'bg-emerald-500', hover: 'hover:bg-emerald-600', underline: 'bg-emerald-500' },
    blue: { btn: 'bg-blue-500', hover: 'hover:bg-blue-600', underline: 'bg-blue-500' },
    amber: { btn: 'bg-amber-500', hover: 'hover:bg-amber-600', underline: 'bg-amber-500' },
  };

  const SUPPORT_LINK = 'https://ts.la/richard834858';

  const BRAND_WORDMARK = (
    <span className="inline-flex items-center gap-2 font-black tracking-tight text-lg" aria-hidden="true">
      <svg className="h-6 w-6" viewBox="0 0 32 32" role="img" aria-hidden="true" focusable="false">
        <rect x="4" y="4" width="24" height="24" rx="6" className="fill-current opacity-90" />
        <path
          d="M10.5 21.5h4.25a3.75 3.75 0 0 0 3.75-3.75v-.5A3.25 3.25 0 0 0 15.25 14H10.5v-3h11v2h-4.25a3.25 3.25 0 0 1 0 6.5H10.5v2Z"
          className="fill-white"
        />
      </svg>
      <span>Tesla Helper</span>
    </span>
  );

  const ACCESSORY_INTRO = 'We keep this list updated with day-one must-haves for each Tesla model. We may earn a commission when you buy through our links—it helps keep TeslaHelper free.';

  const ACCESSORY_TOP_FIVE = {
    'model-y': [
      { title: 'All-weather floor mats', partner: 'threeDMats', blurb: 'Hug the edges and handle winter slush.' },
      { title: 'Screen protector', partner: 'abstractOcean', blurb: 'Matte finish to reduce glare and fingerprints.' },
      { title: 'Center console organizer', partner: 'pimpMyEv', blurb: 'Keeps cables and cards tidy.' },
      { title: 'Phone mount', partner: 'jowua', blurb: 'MagSafe-friendly mounting that fits the vent trim.' },
      { title: 'Trunk/Frunk LEDs', partner: 'pimpMyEv', blurb: 'Brighten the storage areas for night access.' },
    ],
    'model-3': [
      { title: 'All-weather mats', partner: 'threeDMats', blurb: 'Laser-measured coverage for spills.' },
      { title: 'Tempered screen protector', partner: 'abstractOcean', blurb: 'Smudge-resistant glass with easy install.' },
      { title: 'Center console tray', partner: 'pimpMyEv', blurb: 'Quick access to cards and keys.' },
      { title: 'Phone mount', partner: 'jowua', blurb: 'Stable mount that avoids the vent fins.' },
      { title: 'LED kit', partner: 'pimpMyEv', blurb: 'Plug-and-play lighting upgrade.' },
    ],
    'model-s': [
      { title: 'Floor mats', partner: 'threeDMats', blurb: 'Premium protection tailored for Model S interiors.' },
      { title: 'Screen protector', partner: 'abstractOcean', blurb: 'Anti-glare coverage for both displays.' },
      { title: 'Console organizer', partner: 'pimpMyEv', blurb: 'Stops items from sliding around.' },
      { title: 'Phone mount', partner: 'jowua', blurb: 'Low-profile mount that clears the binnacle.' },
      { title: 'LED upgrade', partner: 'pimpMyEv', blurb: 'Brightness boost for trunk and cabin.' },
    ],
    'model-x': [
      { title: 'Floor protection', partner: 'threeDMats', blurb: 'Easy-clean mats for every row.' },
      { title: 'Screen protector', partner: 'abstractOcean', blurb: 'Fingerprint-resistant film for both displays.' },
      { title: 'Organizer set', partner: 'pimpMyEv', blurb: 'Under-armrest storage that fits snugly.' },
      { title: 'Phone mount', partner: 'jowua', blurb: 'Secure mount that keeps the vents unobstructed.' },
      { title: 'LED lighting', partner: 'pimpMyEv', blurb: 'Trunk and cabin brightness upgrade.' },
    ],
    cybertruck: [
      { title: 'Floor liners', partner: 'threeDMats', blurb: 'Rugged liners ready for mud and snow.' },
      { title: 'Screen shield', partner: 'abstractOcean', blurb: 'Matte finish to reduce cabin glare.' },
      { title: 'Console organizer', partner: 'pimpMyEv', blurb: 'Keeps tools and cables sorted.' },
      { title: 'Phone mount', partner: 'jowua', blurb: 'Magnetic mount tuned for the Cybertruck dash.' },
      { title: 'LED strips', partner: 'pimpMyEv', blurb: 'Illuminated bed and vault lighting.' },
    ],
  };

  const NICE_TO_HAVE = ['Mud flaps for winter roads', 'Cup holder stabilizers', 'Key card sleeves', 'Cable ties and Velcro wraps', 'Tire inflator and patch kit'];

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }

  function AccentPicker({ accentName, setAccentName }) {
    const options = [
      { k: 'violet', hex: '#8b5cf6' },
      { k: 'emerald', hex: '#10b981' },
      { k: 'blue', hex: '#3b82f6' },
      { k: 'amber', hex: '#f59e0b' },
    ];
    return (
      <div className="flex flex-wrap items-center gap-2" aria-label="Accent color">
        {options.map((c) => (
          <button
            key={c.k}
            aria-label={'Accent ' + c.k}
            type="button"
            onClick={() => setAccentName(c.k)}
            className={classNames(
              'h-6 w-6 rounded-full ring-2 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
              accentName === c.k ? 'ring-white' : 'ring-transparent'
            )}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    );
  }

  function NavButton({ as: Tag = 'button', variant = 'primary', accent, className, children, ...rest }) {
    const variants = {
      primary: classNames('text-white border-transparent', accent?.btn || 'bg-violet-500', accent?.hover || 'hover:bg-violet-600'),
      secondary: 'bg-neutral-900/80 text-white border border-neutral-700 hover:bg-neutral-800',
      ghost: 'border border-transparent text-white hover:bg-white/5',
    };
    return (
      <Tag
        className={classNames(
          'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-[background-color,color,border-color,transform] duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:opacity-60 disabled:cursor-not-allowed',
          variants[variant],
          className
        )}
        {...rest}
      >
        {children}
      </Tag>
    );
  }

  function normalizePath(pathname) {
    if (!pathname) return '/start';
    const clean = pathname.replace(/\/+/g, '/').replace(/\/$/, '');
    return clean === '' ? '/' : clean;
  }

  function captureUtmParams() {
    const params = new URLSearchParams(window.location.search || '');
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
    const captured = {};
    keys.forEach((k) => {
      const v = params.get(k);
      if (v) captured[k] = v;
    });
    if (Object.keys(captured).length) {
      sessionStorage.setItem(STORAGE_KEYS.utm, JSON.stringify(captured));
    }
    return captured;
  }

  function getStoredUtm() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.utm);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return {};
  }

  function appendUtm(url, override) {
    const utmParams = Object.assign({}, getStoredUtm(), override || {});
    const u = new URL(url, url.startsWith('http') ? undefined : window.location.origin);
    Object.entries(utmParams).forEach(([k, v]) => {
      if (v) u.searchParams.set(k, v);
    });
    return u.toString();
  }

  function generateAffiliateLink(partner, pathOrSku, utmParams, affiliates) {
    const config = affiliates && affiliates[partner];
    if (!config) return '#';
    const base = config.base || '';
    const url = new URL(base, base.startsWith('http') ? undefined : window.location.origin);
    if (pathOrSku) {
      const cleaned = String(pathOrSku).replace(/^\//, '');
      url.pathname = url.pathname.replace(/\/$/, '') + '/' + cleaned;
    }
    if (config.code && !url.searchParams.has('coupon')) url.searchParams.set('coupon', config.code);
    if (config.id && !url.searchParams.has('ref')) url.searchParams.set('ref', config.id);
    return appendUtm(url.toString(), utmParams);
  }

  function trackEvent(name, props) {
    if (window.plausible) {
      window.plausible(name, { props });
    }
  }

  function AnalyticsScripts() {
    useEffect(() => {
      const domain = APP_ENV.plausibleDomain || 'teslahelper.app';
      if (!document.querySelector('script[data-plausible]')) {
        const s = document.createElement('script');
        s.src = 'https://plausible.io/js/script.manual.js';
        s.defer = true;
        s.dataset.domain = domain;
        s.dataset.plausible = 'true';
        document.head.appendChild(s);
      }
      if (APP_ENV.metaPixelId && !document.getElementById('meta-pixel')) {
        const s = document.createElement('script');
        s.id = 'meta-pixel';
        s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
        t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');fbq('init','${APP_ENV.metaPixelId}');`;
        document.head.appendChild(s);
      }
      if (APP_ENV.googleAdsId && !document.getElementById('google-ads')) {
        const s = document.createElement('script');
        s.src = `https://www.googletagmanager.com/gtag/js?id=${APP_ENV.googleAdsId}`;
        s.async = true;
        s.id = 'google-ads';
        document.head.appendChild(s);
        const inline = document.createElement('script');
        inline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','${APP_ENV.googleAdsId}', { 'allow_enhanced_conversions': true });`;
        document.head.appendChild(inline);
      }
    }, []);
    return null;
  }

  function UtmCapture() {
    useEffect(() => {
      captureUtmParams();
    }, []);
    return null;
  }

  function useConfig(path) {
    const [data, setData] = useState(null);
    useEffect(() => {
      fetch(path)
        .then((r) => r.json())
        .then((json) => setData(json))
        .catch(() => setData(null));
    }, [path]);
    return data;
  }

  function BeehiivForm({ formEmbedId, onComplete }) {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const storedUtm = getStoredUtm();

    const handleSubmit = (e) => {
      e.preventDefault();
      setSubmitted(true);
      trackEvent('lead', { variant: resolveVariant('landingHeadline') });
      if (window.fbq) window.fbq('track', 'Lead');
      if (window.gtag) window.gtag('event', 'conversion', { send_to: APP_ENV.googleAdsId });
      onComplete && onComplete();
      setTimeout(() => {
        window.location.href = '/kit';
      }, 300);
    };

    return (
      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <label className="block text-sm font-semibold" htmlFor="email">Get the quick-start</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 focus:outline-none"
        />
        {Object.entries(storedUtm).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <input type="hidden" name="formEmbedId" value={formEmbedId || APP_ENV.beehiivEmbedId} />
        <button
          type="submit"
          className="w-full rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {submitted ? 'Thanks! Check your email' : 'Get my free quick-start'}
        </button>
        <p className="text-xs opacity-75">We respect your inbox. Unsubscribe anytime.</p>
      </form>
    );
  }

  function Hero({ title, subtitle }) {
    return (
      <section className="bg-neutral-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em]">TeslaHelper</p>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{title}</h1>
            <p className="text-lg opacity-90">{subtitle}</p>
            <ul className="space-y-2 text-sm opacity-90 list-disc list-inside">
              <li>Organized by model and year.</li>
              <li>Charging, FSD (Supervised), safety, and day-one setup.</li>
              <li>Email flow → kit → checkout → upsell.</li>
            </ul>
          </div>
          <div className="relative">
            <div
              className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500/10 via-violet-500/10 to-blue-500/10 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-emerald-500/10 p-6 backdrop-blur">
              <OnboardingForm />
            </div>
          </div>
        </div>
      </section>
    );
  }

  function OfferCard({ name, price, bullets, buttonHref }) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xl font-bold">{name}</h3>
          <div className="text-2xl font-extrabold">${price}</div>
        </div>
        <ul className="mt-4 space-y-2 text-sm opacity-90 list-disc list-inside">
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <a
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-3 font-semibold hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          href={buttonHref}
        >
          Buy now
        </a>
      </div>
    );
  }

  function AffiliateCard({ title, image, blurb, partnerKey, pathOrSku, affiliates }) {
    const [clicked, setClicked] = useState(false);
    const href = generateAffiliateLink(partnerKey, pathOrSku, {}, affiliates || {});
    const onClick = () => {
      setClicked(true);
      trackEvent('affiliate_click', { partner: partnerKey, page: window.location.pathname, variant: resolveVariant('landingHeadline') });
      window.open(href, '_blank', 'noopener');
    };
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-neutral-800 grid place-items-center text-xl" aria-hidden="true">
            {image || '🛍️'}
          </div>
          <div>
            <div className="font-semibold text-white">{title}</div>
            <div className="text-sm opacity-80">{blurb}</div>
          </div>
        </div>
        <button
          onClick={onClick}
          className="rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {clicked ? 'Opening…' : 'View pick'}
        </button>
        <a href={href} className="sr-only">Affiliate link</a>
      </div>
    );
  }

  function Disclosure() {
    return (
      <div className="text-xs text-neutral-200 opacity-80 space-y-1">
        <div>
          TeslaHelper is independently developed and not affiliated with, endorsed by, or sponsored by Tesla, Inc. Full Self-Driving (Supervised) requires active driver supervision and does not make the vehicle autonomous.
        </div>
        <div>
          We may earn a commission when you buy through our affiliate links. See the full disclosure on the disclosure page.
        </div>
      </div>
    );
  }

  function resolveVariant(key) {
    const existing = sessionStorage.getItem(STORAGE_KEYS.ab);
    let parsed = {};
    if (existing) {
      try {
        parsed = JSON.parse(existing);
      } catch (e) {
        parsed = {};
      }
    }
    const query = new URLSearchParams(window.location.search);
    const paramKey = key === 'landingHeadline' ? 'ab_headline' : key === 'tripwirePrice' ? 'ab_price' : '';
    const override = paramKey ? query.get(paramKey) : null;
    if (override) {
      parsed[key] = override;
      sessionStorage.setItem(STORAGE_KEYS.ab, JSON.stringify(parsed));
      return override;
    }
    if (parsed[key]) return parsed[key];
    const options = AB_CONFIG[key] || [];
    const value = options.length ? options[0] : 'default';
    parsed[key] = value;
    sessionStorage.setItem(STORAGE_KEYS.ab, JSON.stringify(parsed));
    return value;
  }

  function VariantBadge() {
    const headlineVariant = resolveVariant('landingHeadline');
    const priceVariant = resolveVariant('tripwirePrice');
    return (
      <div className="fixed bottom-3 right-3 rounded-full bg-white/10 px-3 py-2 text-xs text-white backdrop-blur">
        Variant: headline {headlineVariant}, OTO ${priceVariant}
      </div>
    );
  }

  function AccessoriesGrid({ modelKey, affiliates }) {
    const items = ACCESSORY_TOP_FIVE[modelKey] || [];
    const readable = modelKey.replace('model-', 'Model ').replace('cybertruck', 'Cybertruck');
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Top 5 day-one picks</h2>
          <p className="text-sm text-neutral-300">Quick wins for {readable} owners.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <AffiliateCard
              key={item.title}
              title={item.title}
              image="🛠️"
              blurb={item.blurb}
              partnerKey={item.partner}
              affiliates={affiliates}
            />
          ))}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
          <h3 className="font-semibold">Nice to have</h3>
          <ul className="mt-2 space-y-1 text-sm opacity-80 list-disc list-inside">
            {NICE_TO_HAVE.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  function PageShell({ children }) {
    const [navMenuOpen, setNavMenuOpen] = useState(false);
    const [headerSearch, setHeaderSearch] = useState('');
    const [accentName, setAccentName] = useState('violet');
    const navMenuRef = useRef(null);
    const accent = ACCENTS[accentName] || ACCENTS.violet;

    useEffect(() => {
      if (!navMenuOpen) return undefined;
      const handleClick = (e) => {
        if (navMenuRef.current && !navMenuRef.current.contains(e.target)) {
          setNavMenuOpen(false);
        }
      };
      const handleKey = (e) => {
        if (e.key === 'Escape') setNavMenuOpen(false);
      };
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleKey);
      return () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('keydown', handleKey);
      };
    }, [navMenuOpen]);

    const handleSearchSubmit = (e) => {
      e.preventDefault();
      const query = headerSearch.trim();
      const target = query ? `/#library?q=${encodeURIComponent(query)}` : '/#library';
      window.location.href = target;
    };
    const navTabs = [
      { href: '/#library', label: 'Library' },
      { href: '/start', label: 'Start' },
      { href: '/kit', label: 'Starter Kit' },
      { href: '/upsell', label: 'Charging course' },
      { href: '/accessories/model-y', label: 'Accessories' },
      { href: '/chargers', label: 'Chargers' },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-930 to-neutral-950 text-white">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="relative" ref={navMenuRef}>
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:border-white/30"
                  aria-haspopup="menu"
                  aria-expanded={navMenuOpen}
                  aria-controls="marketing-nav-explore-menu"
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
                    id="marketing-nav-explore-menu"
                    className="absolute left-0 mt-2 w-52 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-neutral-900/95 text-white shadow-lg ring-1 ring-black/30"
                    role="menu"
                  >
                    <ul className="py-2">
                      {EXPLORE_MENU_ITEMS.map((item) => (
                        <li key={item.href}>
                          <a
                            className="block px-4 py-2 text-sm focus:outline-none hover:bg-white/10 focus:bg-white/10"
                            href={item.href}
                            role="menuitem"
                            onClick={() => setNavMenuOpen(false)}
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
              <a href="/" className="flex-1 inline-flex items-center justify-center md:justify-start" aria-label="TeslaHelper home">
                {BRAND_WORDMARK}
                <span className="sr-only">Tesla Helper</span>
              </a>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2">
                  <AccentPicker accentName={accentName} setAccentName={setAccentName} />
                </div>
                <NavButton as="a" href="/#library" variant="primary" accent={accent} className="hidden md:inline-flex rounded-full px-4">
                  Open Library
                </NavButton>
                <NavButton
                  as="a"
                  href={SUPPORT_LINK}
                  target="_blank"
                  rel="noreferrer"
                  variant="secondary"
                  className="hidden md:inline-flex rounded-full px-4"
                >
                  Contribute
                </NavButton>
              </div>
            </div>
            <form className="flex w-full items-center gap-3" role="search" onSubmit={handleSearchSubmit}>
              <label className="sr-only" htmlFor="marketing-global-search">
                Search the Tesla Helper library
              </label>
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden="true">
                  🔍
                </span>
                <input
                  id="marketing-global-search"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search for news or Tesla tips"
                  className="w-full rounded-full h-11 pl-11 pr-4 text-sm border border-white/10 bg-neutral-950/90 text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-400/80 focus:border-emerald-400/80"
                />
              </div>
              <NavButton variant="primary" type="submit" accent={accent} className="hidden md:inline-flex rounded-full px-4">
                Search
              </NavButton>
            </form>
            <div className="flex items-center gap-2 sm:hidden">
              <AccentPicker accentName={accentName} setAccentName={setAccentName} />
              <NavButton as="a" href="/#library" variant="primary" accent={accent} className="rounded-full px-3">
                Library
              </NavButton>
            </div>
            <nav className="flex items-center overflow-x-auto pt-1" aria-label="Primary">
              <ul className="flex items-center gap-3 text-sm font-semibold">
                {navTabs.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-white/80 transition hover:text-white hover:bg-white/10"
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
        <main>{children}</main>
        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-6 space-y-3">
            <Disclosure />
            <div className="text-xs text-neutral-300">
              © {new Date().getFullYear()} TeslaHelper · <a className="underline" href="/disclosure">FTC disclosure</a>
            </div>
          </div>
        </footer>
        <VariantBadge />
      </div>
    );
  }

  function OnboardingForm() {
    const stepsTotal = 4;
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formState, setFormState] = useState({
      model: '',
      delivery: '',
      focus: [],
      email: '',
      zip: '',
    });
    const storedUtm = getStoredUtm();
    const progress = Math.round(((step + 1) / stepsTotal) * 100);

    const toggleFocus = (value) => {
      setFormState((prev) => {
        const exists = prev.focus.includes(value);
        const focus = exists ? prev.focus.filter((f) => f !== value) : [...prev.focus, value];
        return { ...prev, focus };
      });
    };

    const handleSelect = (field, value) => setFormState((prev) => ({ ...prev, [field]: value }));
    const handleInput = (e) => {
      const { name, value } = e.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
    };

    const isEmailValid = /.+@.+\..+/.test(formState.email);
    const canContinue = () => {
      if (step === 0) return Boolean(formState.model);
      if (step === 1) return Boolean(formState.delivery);
      if (step === 2) return formState.focus.length > 0;
      return isEmailValid;
    };

    const handleSubmit = () => {
      setSubmitting(true);
      trackEvent('lead', {
        variant: resolveVariant('landingHeadline'),
        model: formState.model,
        delivery: formState.delivery,
        focus: formState.focus.join(', '),
        zip: formState.zip,
        utm_source: storedUtm.utm_source || 'direct',
      });
      if (window.fbq) window.fbq('track', 'Lead');
      if (window.gtag) window.gtag('event', 'conversion', { send_to: APP_ENV.googleAdsId });
      setSubmitted(true);
      setTimeout(() => {
        window.location.href = '/kit';
      }, 450);
    };

    const handleNext = (e) => {
      e.preventDefault();
      if (!canContinue()) return;
      if (step >= stepsTotal - 1) {
        handleSubmit();
      } else {
        setStep((s) => Math.min(s + 1, stepsTotal - 1));
      }
    };

    return (
      <form onSubmit={handleNext} className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Step {step + 1} of {stepsTotal}</p>
            <h3 className="mt-1 text-xl font-bold">
              {step === 0
                ? 'Which Tesla are you setting up?'
                : step === 1
                ? 'When did you receive it?'
                : step === 2
                ? 'What do you need help with?'
                : 'Where should we send the quick-start?'}
            </h3>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
            Secure & spam-free
          </div>
        </div>
        <div className="h-2 rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-blue-400 to-violet-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="space-y-4">
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {['Model Y', 'Model 3', 'Model X', 'Model S', 'Cybertruck'].map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => handleSelect('model', model)}
                  className={classNames(
                    'flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                    formState.model === model
                      ? 'border-emerald-300/80 bg-emerald-400/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20'
                  )}
                >
                  <span className="font-semibold">{model}</span>
                  {formState.model === model ? <span aria-hidden="true">✓</span> : <span aria-hidden="true">→</span>}
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-3">
              {['Ordered / Waiting', 'Delivered in the last 30 days', 'Delivered 1-6 months ago', 'Delivered 6+ months ago'].map((windowLabel) => (
                <button
                  key={windowLabel}
                  type="button"
                  onClick={() => handleSelect('delivery', windowLabel)}
                  className={classNames(
                    'rounded-2xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                    formState.delivery === windowLabel
                      ? 'border-emerald-300/80 bg-emerald-400/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20'
                  )}
                >
                  <div className="font-semibold">{windowLabel}</div>
                  <p className="text-xs text-white/70">We tailor checklists to your delivery stage.</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-white/70">Pick all that apply.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'Charging setup + rebates', value: 'charging' },
                  { label: 'FSD (Supervised) basics', value: 'fsd' },
                  { label: 'Day-one safety + settings', value: 'safety' },
                  { label: 'Accessories + coupons', value: 'accessories' },
                ].map((item) => {
                  const active = formState.focus.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => toggleFocus(item.value)}
                      className={classNames(
                        'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                        active
                          ? 'border-emerald-300/80 bg-emerald-400/10 text-white'
                          : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20'
                      )}
                    >
                      <span className="text-lg">{active ? '✔' : '+'}</span>
                      <span className="font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <label className="text-sm font-semibold" htmlFor="email">
                  Email for your quick-start + Starter Kit offer
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={handleInput}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white shadow-inner focus:border-emerald-400/80 focus:outline-none"
                />
              </div>
              <div className="grid gap-3">
                <label className="text-sm font-semibold" htmlFor="zip">
                  ZIP (optional for utility rebate guidance)
                </label>
                <input
                  id="zip"
                  name="zip"
                  inputMode="numeric"
                  value={formState.zip}
                  onChange={handleInput}
                  placeholder="94103"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white shadow-inner focus:border-emerald-400/80 focus:outline-none"
                />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                <div className="font-semibold text-white">What you get next</div>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Email quick-start tailored to {formState.model || 'your Tesla'}.</li>
                  <li>One-time Starter Kit offer with 30-day guarantee.</li>
                  <li>Optional charging mini-course upsell.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <NavButton
            type="button"
            variant="secondary"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
            className="h-11 px-4"
          >
            Back
          </NavButton>
          <div className="flex-1" />
          <NavButton
            type="submit"
            variant="primary"
            accent={ACCENTS.violet}
            disabled={!canContinue() || submitting}
            className="h-11 px-5"
          >
            {submitting ? 'Sending...' : step >= stepsTotal - 1 ? 'Get my quick-start' : 'Continue'}
          </NavButton>
        </div>

        {submitted && (
          <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            Thanks! Redirecting you to the Starter Kit...
          </div>
        )}

        <div className="text-xs text-white/60">
          Protected by TeslaHelper · No spam. UTM captured: {Object.keys(storedUtm).length ? 'yes' : 'none'}.
        </div>
      </form>
    );
  }

  function StartPage({ affiliates }) {
    const headlineVariant = resolveVariant('landingHeadline');
    const titleCopy = headlineVariant === 'v2' ? 'Your Tesla, decoded in minutes.' : 'New Tesla? Get answers by your model & year—fast.';
    const faq = [
      { q: 'How is content organized?', a: 'By model, year, and hardware so you only see what applies to your Tesla.' },
      { q: 'Do you cover FSD (Supervised)?', a: 'Yes. We include official links and remind you that Full Self-Driving (Supervised) still requires active supervision.' },
      { q: 'Is this an official Tesla site?', a: 'No. TeslaHelper is independent and links to official Tesla resources for verification.' },
      { q: 'What happens after I submit?', a: 'You get the email quick-start, then a one-time starter kit offer with optional upsells.' },
      { q: 'Can I share with friends?', a: 'Yes—forward the quick-start or send them to teslahelper.app/start.' },
    ];
    return (
      <PageShell>
        <Hero
          title={titleCopy}
          subtitle="Charging, FSD (Supervised), safety, day-1 settings—curated and easy."
        />
        <section className="mx-auto max-w-6xl px-4 py-10 space-y-8">
          <div className="grid md:grid-cols-3 gap-4">
            {["Organized by model/year", "Charging, FSD (Supervised), safety", "Fast answers"]
              .map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 font-semibold text-center">
                  {item}
                </div>
              ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[{ title: 'Capture', copy: 'Email quick-start to deliver must-do items.' }, { title: 'OTO', copy: 'One-time Starter Kit offer with order bump.' }, { title: 'Upsell', copy: 'Optional charging mini-course.' }].map((s) => (
              <div key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="text-lg font-semibold">{s.title}</div>
                <p className="text-sm opacity-80 mt-2">{s.copy}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">FAQ</h2>
              <div className="space-y-3">
                {faq.map((item) => (
                  <details key={item.q} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <summary className="font-semibold cursor-pointer">{item.q}</summary>
                    <p className="mt-2 text-sm opacity-80">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold">Ready to start?</h3>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <OnboardingForm />
              </div>
              <div className="text-xs text-neutral-300">Footer includes Tesla disclaimer + FTC affiliate disclosure.</div>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  function KitPage({ offers }) {
    const priceVariant = resolveVariant('tripwirePrice');
    const offerPrice = Number(priceVariant) || (offers?.tripwire?.price || 19);
    const checkoutLink = appendUtm(offers?.tripwire?.gumroadUrl || '#');
    const socialProof = ['“Worth it for day-one setup.”', '“Clearer than the manual.”', '“Loved the cheat sheets.”'];
    useEffect(() => {
      trackEvent('tripwire_view', { variant: priceVariant });
    }, [priceVariant]);
    return (
      <PageShell>
        <section className="mx-auto max-w-5xl px-4 py-12 space-y-8">
          <OfferCard
            name={`Tesla Owner Starter Kit — $${offerPrice}`}
            price={offerPrice}
            bullets={[
              'Delivery-day checklist',
              '15 day-1 settings',
              'Home charging quick start',
              'FSD (Supervised) basics with official links',
              'Printable cheatsheets',
            ]}
            buttonHref={checkoutLink}
          />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">Order bump</div>
            <p className="text-sm opacity-80">+ $7 Accessories Quick Picks & Coupons.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {socialProof.map((q) => (
              <div key={q} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">{q}</div>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">FAQ + Guarantee</h3>
            <p className="text-sm opacity-80">30-day guarantee. Email us if you need help—no hassle.</p>
          </div>
        </section>
      </PageShell>
    );
  }

  function UpsellPage({ offers }) {
    const upsellHref = appendUtm(offers?.upsell?.gumroadUpsellUrl || '#');
    useEffect(() => {
      trackEvent('upsell_view', {});
    }, []);
    return (
      <PageShell>
        <section className="mx-auto max-w-5xl px-4 py-12 space-y-6">
          <OfferCard
            name="Home Charging Mini-Course + Rebate Walkthrough"
            price={offers?.upsell?.price || 49}
            bullets={[
              '30-minute video + worksheet',
              'Apartment vs. garage setups',
              'Rebate walkthrough',
              'Recommended chargers & discounts',
            ]}
            buttonHref={upsellHref}
          />
          <div className="text-sm">
            <a href="/thank-you" className="underline">No thanks</a>
          </div>
        </section>
      </PageShell>
    );
  }

  function AccessoriesPage({ affiliates }) {
    const modelKey = normalizePath(window.location.pathname).split('/').pop();
    return (
      <PageShell>
        <section className="mx-auto max-w-6xl px-4 py-12 space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white">Accessories quick picks</h1>
            <p className="text-sm text-neutral-300">{ACCESSORY_INTRO}</p>
            <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-xs text-neutral-200">We may earn a commission when you buy through our links.</div>
          </div>
          <AccessoriesGrid modelKey={modelKey} affiliates={affiliates} />
          <div className="rounded-2xl border border-white/10 bg-violet-500/10 p-4 text-white">
            <div className="font-semibold">As seen in the Starter Kit</div>
            <p className="text-sm opacity-80">Bundle these picks plus coupons inside the kit.</p>
            <a className="underline font-semibold" href="/kit">Open Starter Kit offer</a>
          </div>
        </section>
      </PageShell>
    );
  }

  function ChargersPage({ affiliates }) {
    return (
      <PageShell>
        <section className="mx-auto max-w-5xl px-4 py-12 space-y-8">
          <h1 className="text-3xl font-bold">Apartment vs. Garage?</h1>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold">Apartment</div>
              <p className="text-sm opacity-80">Portable + shared charging tips.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="font-semibold">Garage</div>
              <p className="text-sm opacity-80">Hardwired convenience and rebates.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Lectron (budget)', partner: 'lectron' },
              { title: 'Emporia (smart)', partner: 'emporia' },
              { title: 'Grizzl-E / Wallbox (rugged/premium)', partner: 'lectron' },
            ].map((p) => (
              <AffiliateCard
                key={p.title}
                title={p.title}
                image="🔌"
                blurb="Solid pick with Tesla compatibility."
                partnerKey={p.partner}
                affiliates={affiliates}
              />
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            Rebate note: many utilities reimburse home charging installs. <a className="underline" href="/upsell">See the upsell course</a> for walkthroughs.
          </div>
        </section>
      </PageShell>
    );
  }

  function InsurancePage({ affiliates }) {
    return (
      <PageShell>
        <section className="mx-auto max-w-5xl px-4 py-12 space-y-6">
          <h1 className="text-3xl font-bold">Compare EV insurance</h1>
          <p className="text-sm text-neutral-300">Check quotes with EV-friendly brokers.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Insurify', partner: 'insurify' },
              { title: 'Jerry', partner: 'jerry' },
              { title: 'Policygenius', partner: 'policygenius' },
            ].map((p) => (
              <AffiliateCard
                key={p.title}
                title={p.title}
                image="🛡️"
                blurb="Compare quotes quickly."
                partnerKey={p.partner}
                affiliates={affiliates}
              />
            ))}
          </div>
          <div className="text-xs text-neutral-300">Affiliate/Referral disclosure above applies.</div>
        </section>
      </PageShell>
    );
  }

  function DisclosurePage() {
    return (
      <PageShell>
        <section className="mx-auto max-w-4xl px-4 py-12 space-y-4">
          <h1 className="text-3xl font-bold">FTC affiliate disclosure</h1>
          <p className="text-sm opacity-80">We earn commissions when you use our affiliate links. It helps keep TeslaHelper free. We only recommend items we would use ourselves.</p>
          <h2 className="text-xl font-bold">Tesla non-affiliation</h2>
          <p className="text-sm opacity-80">TeslaHelper is independently developed and not affiliated with, endorsed by, or sponsored by Tesla, Inc. Full Self-Driving (Supervised) requires active driver supervision and does not make the vehicle autonomous.</p>
        </section>
      </PageShell>
    );
  }

  function ThankYouPage() {
    useEffect(() => {
      trackEvent('purchase', { order: 'tripwire' });
      if (window.fbq) window.fbq('track', 'Purchase', { value: 19, currency: 'USD' });
      const params = new URLSearchParams(window.location.search || '');
      if (params.get('upsell') === '1') {
        trackEvent('upsell_purchase', {});
      }
    }, []);
    return (
      <PageShell>
        <section className="mx-auto max-w-4xl px-4 py-12 space-y-4">
          <h1 className="text-3xl font-bold">Thank you!</h1>
          <p className="text-sm opacity-80">Your Tesla Helper kit is on the way. Ready for charging guidance?</p>
          <a className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700" href="/upsell">See the charging mini-course</a>
        </section>
      </PageShell>
    );
  }

  function MarketingApp() {
    const affiliates = useConfig('/config/affiliates.json') || {};
    const offers = useConfig('/config/offers.json') || {};
    const route = normalizePath(window.location.pathname);
    const meta = ROUTE_META[route] || ROUTE_META['/start'];

    useEffect(() => {
      if (meta) {
        document.title = meta.title;
        const desc = document.querySelector('meta[name="description"]');
        if (desc) desc.setAttribute('content', meta.description);
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          document.head.appendChild(canonical);
        }
        canonical.href = `https://teslahelper.app${route}`;
      }
    }, [meta, route]);

    const page = useMemo(() => {
      if (route === '/kit') return <KitPage offers={offers} />;
      if (route === '/upsell') return <UpsellPage offers={offers} />;
      if (route.startsWith('/accessories/')) return <AccessoriesPage affiliates={affiliates} />;
      if (route === '/chargers') return <ChargersPage affiliates={affiliates} />;
      if (route === '/insurance') return <InsurancePage affiliates={affiliates} />;
      if (route === '/disclosure') return <DisclosurePage />;
      if (route === '/thank-you') return <ThankYouPage />;
      return <StartPage affiliates={affiliates} />;
    }, [route, affiliates, offers]);

    return (
      <>
        <AnalyticsScripts />
        <UtmCapture />
        {page}
      </>
    );
  }

  const rootEl = document.getElementById('root');
  if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(<MarketingApp />);
  }
})();
