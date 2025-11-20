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
  const { useState, useEffect, useMemo, useId, useRef } = React;

  /* ------------------------------------------------------------------
   * Brand definition
   * ------------------------------------------------------------------ */
  const BRAND_NAME = 'Tesla Helper';
  const BRAND = {
    name: BRAND_NAME,
    tagline: 'Know your Tesla in minutes.',
    defaultAccent: 'violet',
    wordmark: (
      <span className="inline-flex items-center gap-2 font-black tracking-tight text-lg" aria-hidden="true">
        <svg
          className="h-6 w-6"
          viewBox="0 0 32 32"
          role="img"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="4" y="4" width="24" height="24" rx="6" className="fill-current opacity-90" />
          <path
            d="M10.5 21.5h4.25a3.75 3.75 0 0 0 3.75-3.75v-.5A3.25 3.25 0 0 0 15.25 14H10.5v-3h11v2h-4.25a3.25 3.25 0 0 1 0 6.5H10.5v2Z"
            className="fill-white"
          />
        </svg>
        <span>{BRAND_NAME}</span>
      </span>
    ),
  };
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
   * Section title component
   *
   * Displays a heading and optional subtitle.
   * ------------------------------------------------------------------ */
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
        <SectionTitle title="Pick your Tesla" subtitle="Select a model to jump into its how‑to library." />
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
          title="How‑To Library"
          subtitle={`Concise videos from Tesla’s official guides, organized by model and year. Last reviewed: ${LAST_REVIEWED.date} · SW ${LAST_REVIEWED.software}.`}
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
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [accentName, setAccentName] = useState(BRAND.defaultAccent);
    const accent = useMemo(() => ACCENTS[accentName] || ACCENTS.violet, [accentName]);
    const isDark = mode === 'dark';
    const pageBg = isDark ? 'bg-neutral-950 text-white' : 'bg-white text-neutral-900';
    const headerBg = isDark ? 'bg-neutral-900/95 border-neutral-800' : 'bg-white/95 border-neutral-200';

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
      { href: '/start', label: 'Start' },
      { href: '/kit', label: 'Kit' },
      { href: '/upsell', label: 'Upsell' },
      { href: '/accessories/model-y', label: 'Accessories' },
      { href: '/chargers', label: 'Chargers' },
      { href: '/insurance', label: 'Insurance' },
      { href: '/disclosure', label: 'Disclosure' },
      { href: '/thank-you', label: 'Thank you' },
    ];

    return (
      <div id="top" className={classNames('min-h-screen', pageBg)}>
        <header
          className={classNames('sticky top-0 z-40 backdrop-blur border-b', headerBg, headerCompact ? 'py-2' : 'py-3')}
          style={headerStyle}
        >
          <div className="mx-auto max-w-6xl px-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between min-h-[56px]">
            <div className="flex items-center justify-between gap-3">
              <a href="https://teslahelper.app" className="inline-flex items-center" aria-label={BRAND.name}>
                {BRAND.wordmark}
                <span className="sr-only">{BRAND.name}</span>
              </a>
              <div className="flex items-center gap-2 md:hidden">
                <AccentPicker accentName={accentName} setAccentName={setAccentName} />
                <Button
                  variant="ghost"
                  size="sm"
                  aria-pressed={isDark}
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  onClick={() => setMode(isDark ? 'light' : 'dark')}
                  isDark={isDark}
                >
                  {isDark ? '🌞' : '🌙'}
                </Button>
              </div>
            </div>
            <form
              className={classNames(
                'flex flex-col gap-2 md:flex-row md:items-center md:gap-3 w-full md:w-auto md:flex-1 md:order-none order-first'
              )}
              role="search"
              onSubmit={handleSearchSubmit}
            >
              <label className="sr-only" htmlFor="global-search">
                Search the Tesla Helper library
              </label>
              <div className="flex-1 md:max-w-xl">
                <input
                  id="global-search"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search (e.g., Sentry, PIN to Drive, HW4)"
                  className={classNames(
                    'w-full rounded-lg h-10 px-3 text-sm border focus:outline-none focus:ring-2 shadow-sm',
                    isDark
                      ? 'bg-neutral-950 border-neutral-800 text-white focus:ring-violet-400'
                      : 'bg-white border-neutral-300 text-neutral-900 focus:ring-violet-500'
                  )}
                />
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" type="submit" isDark={isDark}>
                  Search
                </Button>
              </div>
            </form>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <div className="hidden md:flex items-center gap-2">
                <AccentPicker accentName={accentName} setAccentName={setAccentName} />
                <Button
                  variant="ghost"
                  size="sm"
                  aria-pressed={isDark}
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                  onClick={() => setMode(isDark ? 'light' : 'dark')}
                  isDark={isDark}
                >
                  {isDark ? '🌞' : '🌙'}
                </Button>
              </div>
              <div className="relative" ref={navMenuRef}>
                <button
                  type="button"
                  className={classNames(
                    'inline-flex items-center gap-1 rounded-full border px-3 py-2 text-sm font-semibold transition',
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
                  Explore
                  <span aria-hidden="true">▾</span>
                </button>
                {navMenuOpen && (
                  <div
                    id="main-nav-explore-menu"
                    className={classNames(
                      'absolute left-1/2 mt-2 w-48 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border shadow-lg ring-1 sm:left-auto sm:right-0 sm:translate-x-0',
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
              <Button
                as="a"
                href="https://auth.tesla.com/"
                target="_blank"
                rel="noreferrer"
                variant="secondary"
                size="md"
                className="w-full md:w-auto min-w-[132px]"
                isDark={isDark}
              >
                Log into Tesla
              </Button>
              <Button
                as="a"
                href="#library"
                variant="primary"
                size="md"
                className="w-full md:w-auto min-w-[132px]"
                accent={accent}
                isDark={isDark}
              >
                Open Library
              </Button>
              <Button
                as="a"
                href={SUPPORT_LINK}
                target="_blank"
                rel="noreferrer"
                variant="secondary"
                size="sm"
                isDark={isDark}
                className="w-full md:w-auto min-w-[132px]"
              >
                Contribute
              </Button>
            </div>
          </div>
        </header>
        {/* Hero / quick links */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-14 grid md:grid-cols-2 gap-6 items-start">
            <div>
              <p className="uppercase tracking-widest text-xs opacity-80">Your Tesla · Your Guide</p>
              <h1
                className="font-extrabold leading-tight mt-2"
                style={{ fontSize: 'clamp(1.5rem, 2vw + 1rem, 2rem)', letterSpacing: '0.1px', lineHeight: 1.3 }}
              >
                The Tesla Helper App
              </h1>
              <ul className="mt-4 space-y-1 text-sm opacity-90">
                <li>• Find exactly what you need fast—charging, FSD, safety, and more.</li>
                <li>• Organized by model and year so nothing is confusing or missing.</li>
                <li>• Short, official videos with plain‑English summaries.</li>
              </ul>
              <div className="mt-6 flex gap-3 flex-wrap">
                <Button as="a" href="#models" variant="primary" accent={accent} isDark={isDark}>
                  Pick your model
                </Button>
                <Button onClick={() => setShowInstallModal(true)} variant="secondary" isDark={isDark}>
                  Add to Home Screen
                </Button>
              </div>
              <p className="mt-3 text-xs opacity-70">Designed for clarity · Fast on mobile</p>
            </div>
            <div className="relative w-full space-y-4" aria-hidden="true" />
          </div>
          <div className="mx-auto max-w-6xl px-4">
            <div className={classNames('h-1 rounded-full w-24', accent.underline)} />
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 pb-10" aria-label="Quick links">
          <Card className={classNames('border px-3 py-3 md:px-4 md:py-3', isDark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-neutral-50 border-neutral-200')}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="font-semibold flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">⭐</span>
                Quick links
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 w-full md:w-auto">
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
            title="Stay aligned with official guidance"
            subtitle="Every tip links back to Tesla resources so you can verify details by model, region, and software."
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
  }
})();
