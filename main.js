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
  const { useState, useEffect, useMemo } = React;

  /* ------------------------------------------------------------------
   * Brand definition
   * ------------------------------------------------------------------ */
  const BRAND = {
    name: 'Tesla Helper',
    tagline: 'Know your Tesla in minutes.',
    logo: 'logo.svg',
    defaultAccent: 'violet',
  };
  const SUPPORT_LINK = 'https://ts.la/richard834858';

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
  };

  /* ------------------------------------------------------------------
   * Utility: classNames
   *
   * Joins an array of class names while filtering out falsy values.
   * ------------------------------------------------------------------ */
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
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
   * Section title component
   *
   * Displays a heading and optional subtitle.
   * ------------------------------------------------------------------ */
  function SectionTitle({ title, subtitle }) {
    return (
      <div className="mb-5">
        <h2 className="text-xl font-semibold">{title}</h2>
        {subtitle ? <p className="text-sm opacity-80 mt-1">{subtitle}</p> : null}
      </div>
    );
  }

  /* ------------------------------------------------------------------
   * Accent picker component
   *
   * Renders small circular swatches that switch the active accent.
   * ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------
   * Car tile component
   *
   * Displays a car image with a button that scrolls to the library
   * filtered for the given model. The accent colours are passed in.
   * ------------------------------------------------------------------ */
  function CarTile({ id, accent, carImages }) {
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
            <a
              href={'#library?model=' + encodeURIComponent(m.label)}
              className={classNames('shrink-0 rounded-lg px-3 py-2 text-sm font-semibold hover:opacity-90', accent.btn, accent.hover)}
            >
              Open library
            </a>
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
  function CarsGrid({ accent, carImages }) {
    const ids = ['model3', 'models', 'modelx', 'modely'];
    return (
      <section id="models" className="mx-auto max-w-6xl px-4 pb-16">
        <SectionTitle title="Pick your Tesla" subtitle="Select a model to jump into its how‑to library." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ids.map((id) => (
          <CarTile key={id} id={id} accent={accent} carImages={carImages} />
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
    const borderSoft = isDark ? 'border-neutral-800' : 'border-neutral-200';
    const cardBg = isDark ? 'bg-neutral-900' : 'bg-neutral-50';
    return (
      <Card className={classNames(cardBg, 'border', borderSoft)}>
        <button onClick={() => setOpen((o) => !o)} className="w-full text-left p-4 font-semibold">
          {cat.name}
        </button>
        {open && (
          <div className="px-4 pb-3">
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
        .then((json) => setLib(json))
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

    const searchLower = q.trim().toLowerCase();
    function catMatches(cat) {
      if (!searchLower) return true;
      if (cat.name.toLowerCase().includes(searchLower)) return true;
      return cat.videos.some(
        (v) => v.title.toLowerCase().includes(searchLower) || v.copy.toLowerCase().includes(searchLower)
      );
    }

    const borderSoft = isDark ? 'border-neutral-800' : 'border-neutral-200';
    const cardBg = isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200';

    return (
      <section id="library" className="mx-auto max-w-6xl px-4 pb-24">
        <SectionTitle
          title="How‑To Library"
          subtitle="Concise videos from Tesla’s official guides, organized by model and year."
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
            <a
              href="#models"
              className={classNames('text-center rounded-lg px-3 py-2 text-sm font-semibold hover:opacity-90', ACCENTS.violet.btn, ACCENTS.violet.hover)}
            >
              Back to Models
            </a>
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
    const [mode, setMode] = useState('dark');
    const [accentName, setAccentName] = useState(BRAND.defaultAccent);
    const accent = useMemo(() => ACCENTS[accentName] || ACCENTS.violet, [accentName]);
    const isDark = mode === 'dark';
    const pageBg = isDark ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-900';
    const headerBg = isDark ? 'bg-neutral-900/95 border-neutral-800' : 'bg-white/90 border-neutral-200';

    // Car images are loaded lazily from tesla_helper_base64_1280.json. The keys in
    // the JSON map correspond to model names (model3, models, modelx, modely).
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
    return (
      <div id="top" className={classNames('min-h-screen', pageBg)}>
        <header className={classNames('sticky top-0 z-40 backdrop-blur border-b', headerBg)}>
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <a href="#top" className="inline-flex items-center" aria-label={BRAND.name}>
                <img src={BRAND.logo} alt={`${BRAND.name} logo`} className="h-8 w-auto" />
              </a>
              <div className="font-semibold hidden sm:block">{BRAND.name}</div>
              <a
                href={SUPPORT_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-red-500/60 bg-red-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-red-500/30 hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span aria-hidden="true">❤️</span> Support Us
              </a>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a className="hover:opacity-80" href="#models">Models</a>
              <a className="hover:opacity-80" href="#library">Library</a>
            </nav>
            <div className="flex flex-col gap-2 w-full md:w-auto md:flex-row md:items-center md:justify-end">
              <AccentPicker accentName={accentName} setAccentName={setAccentName} />
              <button
                data-testid="mode-toggle"
                onClick={() => setMode(isDark ? 'light' : 'dark')}
                className={classNames(
                  'rounded-lg px-3 py-2 border text-sm hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                  isDark ? 'border-neutral-800' : 'border-neutral-200'
                )}
              >
                {isDark ? 'Light' : 'Dark'}
              </button>
              <a
                href="#library"
                className={classNames(
                  'px-3 py-2 rounded-lg text-sm font-semibold text-center hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                  'w-full md:w-auto',
                  accent.btn,
                  accent.hover
                )}
              >
                Open Library
              </a>
            </div>
          </div>
        </header>
        {/* Hero / quick links */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-14 grid md:grid-cols-2 gap-6 items-start">
            <div>
              <p className="uppercase tracking-widest text-xs opacity-80">Your Tesla · Your Guide</p>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mt-2">The Tesla Helper App</h1>
              <ul className="mt-4 space-y-1 text-sm opacity-90">
                <li>• Find exactly what you need fast—charging, FSD, safety, and more.</li>
                <li>• Organized by model and year so nothing is confusing or missing.</li>
                <li>• Short, official videos with plain‑English summaries.</li>
              </ul>
              <div className="mt-6 flex gap-3 flex-wrap">
                <a href="#models" className={classNames('px-4 py-3 rounded-xl font-semibold hover:opacity-90', accent.btn, accent.hover)}>
                  Pick your model
                </a>
                <a href="#library" className={classNames('px-4 py-3 rounded-xl font-semibold border hover:opacity-80', isDark ? 'border-neutral-800' : 'border-neutral-200')}>
                  Browse by topic
                </a>
              </div>
              <p className="mt-3 text-xs opacity-70">Designed for clarity · Fast on mobile</p>
            </div>
            <div className="relative w-full">
              <Card className={classNames('p-4', isDark ? 'bg-neutral-900/80 border border-neutral-800' : 'bg-neutral-50 border border-neutral-200')}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Quick links</div>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
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
                      className={classNames('rounded-xl px-3 py-3 text-sm font-semibold text-center text-white hover:opacity-90', accent.btn, accent.hover)}
                    >
                      <div className="text-lg mb-1">{q.icon}</div>
                      {q.label}
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-4">
            <div className={classNames('h-1 rounded-full w-24', accent.underline)} />
          </div>
        </section>
        {/* Models and library */}
        <CarsGrid accent={accent} carImages={carImages} />
        <LibraryPanel accent={accent} isDark={isDark} />
        <footer className={classNames('border-t', isDark ? 'border-neutral-800' : 'border-neutral-200')}>
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm opacity-80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</div>
            <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
              <div className="flex items-center gap-4">
                <a className="hover:opacity-100" href="#">Terms</a>
                <a className="hover:opacity-100" href="#">Privacy</a>
                <a className="hover:opacity-100" href="#">Accessibility</a>
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
      </div>
    );
  }

  // Mount the application once the page loads
  const rootEl = document.getElementById('root');
  if (rootEl) {
    const root = ReactDOM.createRoot(rootEl);
    root.render(<TeslaHelperApp />);
  }
})();
