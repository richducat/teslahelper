(() => {
  const { useState, useEffect, useMemo } = React;
  const e = React.createElement;

  // Define your sections and their steps
  const SECTIONS = [
    {
      id: 'quickstart',
      title: 'Quick Start',
      steps: [
        'Adjust your seat',
        'Adjust mirrors',
        'Fasten seatbelt',
        'Select drive mode',
        'Press brake to start'
      ]
    },
    {
      id: 'drive',
      title: 'How to Drive',
      steps: [
        'Start the car',
        'Shift into Drive',
        'Accelerate and brake',
        'Regenerative braking',
        'Park the car'
      ]
    },
    {
      id: 'controls',
      title: 'Controls & Basics',
      steps: [
        'Use the touchscreen',
        'Wipers & washers',
        'Turn signals & lights',
        'Steering wheel controls'
      ]
    },
    {
      id: 'charging',
      title: 'Charging',
      steps: [
        'Open charge port',
        'Plug in the charger',
        'Monitor charging'
      ]
    },
    {
      id: 'autopilot',
      title: 'Autopilot & Safety',
      steps: [
        'Enable Autopilot',
        'Adjust following distance',
        'Use Navigate on Autopilot',
        'Disable Autopilot safely'
      ]
    },
    {
      id: 'phonekey',
      title: 'Phone as Key / App',
      steps: [
        'Download Tesla app',
        'Pair phone as key',
        'Unlock and start with phone',
        'Remote control functions'
      ]
    },
    {
      id: 'climate',
      title: 'Climate & Defrost',
      steps: [
        'Adjust cabin temperature',
        'Use seat heaters',
        'Defrost windshield',
        'Activate Dog/Sentry mode'
      ]
    },
    {
      id: 'delivery',
      title: 'Delivery Checklist',
      steps: [
        'Inspect exterior and interior',
        'Check VIN and paperwork',
        'Pair key cards and phone',
        'Verify software version'
      ]
    }
  ];

  // Default video map per vehicle
  function defaultVideoMap(vehicle) {
    const base = {
      quickstart: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Essentials_MYT.mp4',
      drive:      'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Physical-Controls_3Y_MYT_Video.mp4',
      controls:   'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Touchscreen_3Y_MYT_Video.mp4',
      charging:   'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Charging_3Y_MYT_Video.mp4',
      autopilot:  'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Autopilot_3Y_MYT_Video.mp4',
      phonekey:   'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Tesla-App-Vehicle-Controls_All_Video.mp4',
      climate:    'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Touchscreen_3Y_MYT_Video.mp4',
      delivery:   'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Essentials_MYT.mp4'
    };
    if (vehicle === 'S' || vehicle === 'X') {
      base.drive    = 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Physical-Controls_SX_MYT_Video.mp4';
      base.controls = 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Touchscreen_SX_MYT_Video.mp4';
    }
    if (vehicle === 'CT') {
      base.drive = base.drive || 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Physical-Controls_3Y_MYT_Video.mp4';
    }
    return base;
  }

  // Recommended playlists per section and vehicle
  function defaultPlaylist(vehicle) {
    const map = defaultVideoMap(vehicle);
    return {
      quickstart: [
        { title: 'Essentials / First Drive', url: map.quickstart },
        { title: 'Driver Profiles', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Driver-Profiles_3Y_MYT_Video.mp4' }
      ],
      drive: [
        { title: 'Physical Controls', url: map.drive },
        { title: 'Wipers', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Wipers_3Y_MYT_Video.mp4' }
      ],
      controls: [
        { title: 'Touchscreen Overview', url: map.controls },
        { title: 'Customize Controls', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Customize-Controls_3Y_MYT_Video.mp4' }
      ],
      charging: [
        { title: 'Charging Basics', url: map.charging },
        { title: 'Trip Planner', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Trip-Planner_3Y_MYT_Video.mp4' }
      ],
      autopilot: [
        { title: 'Autopilot Basics', url: map.autopilot },
        { title: 'Navigate on Autopilot', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Navigate-on-Autopilot_3Y_MYT_Video.mp4' }
      ],
      phonekey: [
        { title: 'Tesla App Vehicle Controls', url: map.phonekey },
        { title: 'Phone Key Setup', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Phone-Key_3Y_MYT_Video.mp4' }
      ],
      climate: [
        { title: 'Climate on Touchscreen', url: map.climate },
        { title: 'Cabin Overheat', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Cabin-Overheat_3Y_MYT_Video.mp4' }
      ],
      delivery: [
        { title: 'Essentials / First Drive', url: map.delivery },
        { title: 'Keys & Cards', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Keys_3Y_MYT_Video.mp4' }
      ]
    };
  }

  // Simple hook to persist state in localStorage
  function useLocalStorage(key, initial) {
    const [value, setValue] = useState(() => {
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initial;
      } catch {
        return initial;
      }
    });
    useEffect(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }, [key, value]);
    return [value, setValue];
  }

  // Manage video URLs per vehicle
  function useVideoMap(vehicle) {
    const [maps, setMaps] = useLocalStorage('teslaHelper.videos', {});
    const map = maps[vehicle] || defaultVideoMap(vehicle);
    const setUrl = (sectionId, url) => {
      setMaps(Object.assign({}, maps, {
        [vehicle]: Object.assign({}, map, { [sectionId]: url })
      }));
    };
    const resetUrl = (sectionId) => {
      const defaults = defaultVideoMap(vehicle);
      setMaps(Object.assign({}, maps, {
        [vehicle]: Object.assign({}, map, { [sectionId]: defaults[sectionId] || '' })
      }));
    };
    return [map, setUrl, resetUrl];
  }

  // Convert user-provided URL to embed if needed
  function embedUrlFromInput(url) {
    if (!url) return '';
    try {
      const vimeo = url.match(/^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/);
      if (vimeo) return 'https://player.vimeo.com/video/' + vimeo[1];
      const yt = url.match(/^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      if (yt) return 'https://www.youtube.com/embed/' + yt[1];
    } catch {}
    return url;
  }

  function VideoPanel({ url }) {
    if (!url) return null;
    const isVideo = /\.mp4(\?|$)/.test(url);
    if (isVideo) {
      return e('video', { controls: true, className: 'w-full rounded-xl', src: url });
    }
    const src = embedUrlFromInput(url);
    return e('div', { className: 'w-full aspect-video' },
      e('iframe', {
        src,
        frameBorder: '0',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
        allowFullScreen: true,
        className: 'w-full h-full rounded-xl'
      })
    );
    }

  function VideoEditor({ sectionId, current, onSave, onReset, recommendations }) {
    const [value, setValue] = useState(current || '');
    useEffect(() => setValue(current || ''), [current]);
    return e('div', { className: 'space-y-3' }, [
      e('input', {
        className: 'w-full p-3 rounded-xl bg-neutral-900/70 border border-neutral-700 text-neutral-100',
        placeholder: 'Paste YouTube/Vimeo/MP4 link for this section',
        value,
        onChange: ev => setValue(ev.target.value)
      }),
      e('div', { className: 'flex items-center gap-2 flex-wrap' }, [
        e('button', {
          className: 'px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:border-neutral-600',
          onClick: () => onSave(value || '')
        }, 'Save Video'),
        e('button', {
          className: 'px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:border-neutral-600',
          onClick: () => onReset()
        }, 'Use Recommended'),
        e('span', { className: 'text-neutral-400 text-sm' }, 'Saved per section on this device.')
      ]),
      (recommendations && recommendations.length) ? e('div', { className: 'space-y-2' }, [
        e('div', { className: 'text-sm text-neutral-300' }, 'Recommended Playlist'),
        e('div', { className: 'grid gap-2' },
          recommendations.map((rec, i) =>
            e('button', {
              key: i,
              className: 'flex items-center justify-between p-3 rounded-xl border border-neutral-700 bg-neutral-800 hover:border-neutral-600 text-left',
              onClick: () => onSave(rec.url)
            }, [
              e('div', null, [
                e('div', { className: 'text-neutral-100' }, rec.title),
                e('div', { className: 'text-xs text-neutral-400 break-all' }, rec.url)
              ]),
              e('span', { className: 'text-neutral-400' }, 'Use')
            ])
          )
        )
      ]) : null
    ]);
  }

  function Section({ section, videoUrl, onSaveVideo, onResetVideo, playlist }) {
    const [mode, setMode] = useState('steps');
    return e('div', { className: 'mb-8' }, [
      e('div', { className: 'flex justify-between items-center mb-2' }, [
        e('div', { className: 'font-semibold text-lg' }, section.title),
        e('div', { className: 'flex gap-2' }, [
          e('button', {
            className: (mode === 'steps' ? 'bg-blue-600' : 'bg-neutral-700') + ' text-white px-3 py-1 rounded-lg text-sm',
            onClick: () => setMode('steps')
          }, 'Steps'),
          e('button', {
            className: (mode === 'video' ? 'bg-blue-600' : 'bg-neutral-700') + ' text-white px-3 py-1 rounded-lg text-sm',
            onClick: () => setMode('video')
          }, 'Video')
        ])
      ]),
      mode === 'steps'
        ? e('ul', { className: 'list-disc pl-5 space-y-1 text-base text-neutral-200' },
            section.steps.map((st, i) => e('li', { key: i }, st))
          )
        : e('div', { className: 'space-y-4' }, [
            e(VideoPanel, { url: videoUrl }),
            e(VideoEditor, {
              sectionId: section.id,
              current: videoUrl,
              onSave: url => onSaveVideo(section.id, url),
              onReset: () => onResetVideo(section.id),
              recommendations: playlist
            })
          ])
    ]);
  }

  function App() {
    const VEHICLES = ['3','Y','S','X','CT'];
    const [vehicle, setVehicle] = useLocalStorage('teslaHelper.vehicle', '3');
    const [videoMap, setVideoUrl, resetVideoUrl] = useVideoMap(vehicle);
    const playlists = useMemo(() => defaultPlaylist(vehicle), [vehicle]);
    return e('div', { className: 'mx-auto max-w-2xl p-4' }, [
      e('h1', { className: 'text-3xl font-bold mb-4' }, 'Tesla Helper'),
      e('div', { className: 'flex gap-2 mb-6' },
        VEHICLES.map(v => {
          const isActive = v === vehicle;
          const label = v === '3' ? 'Model 3' :
                        v === 'Y' ? 'Model Y' :
                        v === 'S' ? 'Model S' :
                        v === 'X' ? 'Model X' : 'Model CT';
          return e('button', {
            key: v,
            className: (isActive ? (v === 'CT' ? 'bg-red-600' : 'bg-blue-600') : 'bg-neutral-700') +
                       ' text-white px-3 py-1 rounded-lg text-sm',
            onClick: () => setVehicle(v)
          }, label);
        })
      ),
      SECTIONS.map(sec => e(Section, {
        key: sec.id,
        section: sec,
        videoUrl: videoMap[sec.id],
        onSaveVideo: (id, url) => setVideoUrl(id, url),
        onResetVideo: id => resetVideoUrl(id),
        playlist: playlists[sec.id] || []
      }))
    ]);
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(e(App));
})();
