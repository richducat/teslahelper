/*
 * Marketing pages router for TeslaHelper
 * New landing, kit, upsell, accessories, chargers, insurance, and disclosure pages
 * built on top of the existing lightweight React runtime.
 */

(() => {
  const { useEffect, useMemo, useState } = React;

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
          className="w-full rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {submitted ? 'Thanks! Check your email' : 'Get my free quick-start'}
        </button>
        <p className="text-xs opacity-75">We respect your inbox. Unsubscribe anytime.</p>
      </form>
    );
  }

  function Hero({ title, subtitle, ctaText, formEmbedId }) {
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
          <div className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6">
            <BeehiivForm formEmbedId={formEmbedId} />
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
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-red-500 px-4 py-3 font-semibold hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
          className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-930 to-neutral-950 text-white">
        <header className="border-b border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <a href="/start" className="font-bold text-lg">TeslaHelper</a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/start" className="hover:opacity-80">Start</a>
              <a href="/kit" className="hover:opacity-80">Kit</a>
              <a href="/upsell" className="hover:opacity-80">Upsell</a>
              <a href="/accessories/model-y" className="hover:opacity-80">Accessories</a>
              <a href="/chargers" className="hover:opacity-80">Chargers</a>
              <a href="/insurance" className="hover:opacity-80">Insurance</a>
              <a href="/disclosure" className="hover:opacity-80">Disclosure</a>
            </nav>
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
          ctaText="Get my free quick-start"
          formEmbedId={APP_ENV.beehiivEmbedId}
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
              <BeehiivForm formEmbedId={APP_ENV.beehiivEmbedId} />
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
          <div className="rounded-2xl border border-white/10 bg-red-500/10 p-4 text-white">
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
          <a className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-white" href="/upsell">See the charging mini-course</a>
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
