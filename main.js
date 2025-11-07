(() => {
  const { useState, useEffect, useMemo } = React;
  const e = React.createElement;

  // --- Section definitions ---
  const SECTIONS = [
    { id: 'quickstart', title: 'Quick Start', steps: [
      'Adjust your seat',
      'Adjust mirrors',
      'Fasten seatbelt',
      'Select drive mode',
      'Press brake to start'
    ]},
    { id: 'drive', title: 'How to Drive', steps: [
      'Start the car',
      'Shift into Drive',
      'Accelerate and brake',
      'Regenerative braking',
      'Park the car'
    ]},
    { id: 'controls', title: 'Controls & Basics', steps: [
      'Use the touchscreen',
      'Wipers & washers',
      'Turn signals & lights',
      'Steering wheel controls'
    ]},
    { id: 'charging', title: 'Charging', steps: [
      'Open charge port',
      'Plug in the charger',
      'Monitor charging'
    ]},
    { id: 'autopilot', title: 'Autopilot & Safety', steps: [
      'Enable Autopilot',
      'Adjust following distance',
      'Use Navigate on Autopilot',
      'Disable Autopilot safely'
    ]},
    { id: 'phonekey', title: 'Phone as Key / App', steps: [
      'Download Tesla app',
      'Pair phone as key',
      'Unlock and start with phone',
      'Remote control functions'
    ]},
    { id: 'climate', title: 'Climate & Defrost', steps: [
      'Adjust cabin temperature',
      'Use seat heaters',
      'Defrost windshield',
      'Activate Dog/Sentry mode'
    ]},
    { id: 'delivery', title: 'Delivery Checklist', steps: [
      'Inspect exterior and interior',
      'Check VIN and paperwork',
      'Pair key cards and phone',
      'Verify software version'
    ]}
  ];

  // --- Default video map per model ---
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

  // --- Default playlists per section and model ---
  function defaultPlaylist(vehicle) {
    const m = defaultVideoMap(vehicle);
    return {
      quickstart: [
        { title: 'Essentials / First Drive', url: m.quickstart },
        { title: 'Driver Profiles', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Driver-Profiles_3Y_MYT_Video.mp4' }
      ],
      drive: [
        { title: 'Physical Controls', url: m.drive },
        { title: 'Wipers', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Wipers_3Y_MYT_Video.mp4' }
      ],
      controls: [
        { title: 'Touchscreen Overview', url: m.controls },
        { title: 'Customize Controls', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Customize-Controls_3Y_MYT_Video.mp4' }
      ],
      charging: [
        { title: 'Charging Basics', url: m.charging },
        { title: 'Trip Planner', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Trip-Planner_3Y_MYT_Video.mp4' }
      ],
      autopilot: [
        { title: 'Autopilot Basics', url: m.autopilot },
        { title: 'Navigate on Autopilot', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Navigate-on-Autopilot_3Y_MYT_Video.mp4' }
      ],
      phonekey: [
        { title: 'Tesla App Vehicle Controls', url: m.phonekey },
        { title: 'Phone Key Setup', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Phone-Key_3Y_MYT_Video.mp4' }
      ],
      climate: [
        { title: 'Climate on Touchscreen', url: m.climate },
        { title: 'Cabin Overheat', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Cabin-Overheat_3Y_MYT_Video.mp4' }
      ],
      delivery: [
        { title: 'Essentials / First Drive', url: m.delivery },
        { title: 'Keys & Cards', url: 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Keys_3Y_MYT_Video.mp4' }
      ]
    };
  }

  // --- Persist state in localStorage ---
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

  // --- Manage per-vehicle video preferences ---
  function useVideoMap(vehicle) {
    const [maps, setMaps] = useLocalStorage('teslaHelper.videos', {});
    const map = maps[vehicle] || defaultVideoMap(vehicle);
    const setUrl = (id, url) => {
      setMaps(Object.assign({}, maps, { [vehicle]: Object.assign({}, map, { [id]: url }) }));
    };
    const resetUrl = (id) => {
      const defaults = defaultVideoMap(vehicle);
      setMaps(Object.assign({}, maps, { [vehicle]: Object.assign({}, map, { [id]: defaults[id] || '' }) }));
    };
    return [map, setUrl, resetUrl];
  }

  // --- Convert user-provided URLs to embed URLs ---
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

  // --- Display video or embed ---
  function VideoPanel({ url }) {
  if (!url) return null;
  // If the URL ends in .mp4, use a <video> tag with crossOrigin
  if (/\.mp4(\?|$)/.test(url)) {
    return React.createElement('video', {
      controls: true,
      src: url,
      crossOrigin: 'anonymous',    // <—— add this line
      style: { width: '100%', borderRadius: '8px' }
    });
  }
  // Otherwise, embed YouTube/Vimeo normally
  const src = embedUrlFromInput(url);
  return React.createElement('iframe', {
    src,
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    allowFullScreen: true,
    style: { width: '100%', height: '360px', border: 'none', borderRadius: '8px' }
  });
}


  // --- Video URL editor ---
  function VideoEditor({ sectionId, current, onSave, onReset, recommendations }) {
    const [value, setValue] = useState(current || '');
    useEffect(() => setValue(current || ''), [current]);
    return e('div', null, [
      e('input', {
        value,
        onChange: ev => setValue(ev.target.value),
        placeholder: 'Paste YouTube/Vimeo/MP4 link for this section',
        style: {
          width: '100%',
          padding: '8px',
          borderRadius: '6px',
          border: '1px solid #444',
          backgroundColor: '#111',
          color: '#eee',
          marginBottom: '8px'
        }
      }),
      e('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px' } }, [
        e('button', {
          onClick: () => onSave(value || ''),
          style: {
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #555',
            backgroundColor: '#333',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px'
          }
        }, 'Save Video'),
        e('button', {
          onClick: onReset,
          style: {
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #555',
            backgroundColor: '#333',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px'
          }
        }, 'Use Recommended')
      ]),
      recommendations && recommendations.length ? e('div', null, [
        e('div', { style: { fontSize: '12px', color: '#888', marginBottom: '4px' } }, 'Recommended Playlist'),
        ...recommendations.map((rec, i) =>
          e('div', {
            key: i,
            onClick: () => onSave(rec.url),
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #444',
              backgroundColor: '#222',
              marginBottom: '4px',
              cursor: 'pointer'
            }
          }, [
            e('div', null, [
              e('div', { style: { color: '#eee', fontSize: '14px' } }, rec.title),
              e('div', { style: { color: '#666', fontSize: '10px', wordBreak: 'break-all' } }, rec.url)
            ]),
            e('span', { style: { color: '#888', fontSize: '12px' } }, 'Use')
          ])
        )
      ]) : null
    ]);
  }

  // --- Step descriptions used on card view ---
  const STEP_DESCRIPTIONS = {
    quickstart: {
      'Adjust your seat': 'Position the driver’s seat so you can comfortably reach the pedals and wheel.',
      'Adjust mirrors': 'Tilt your side and rear‑view mirrors for maximum visibility.',
      'Fasten seatbelt': 'Always buckle up before driving for your safety.',
      'Select drive mode': 'Choose Park, Reverse or Drive as appropriate for your situation.',
      'Press brake to start': 'Press and hold the brake pedal to power up and ready the vehicle.'
    },
    drive: {
      'Start the car': 'With your key or phone in range, press the brake pedal to wake up the vehicle.',
      'Shift into Drive': 'Use the shifter or touchscreen based on your model to select Drive.',
      'Accelerate and brake': 'Apply the accelerator to move and the brake pedal to slow or stop.',
      'Regenerative braking': 'Lift your foot off the accelerator to slow the car and recharge the battery.',
      'Park the car': 'Use the Park button (or stalk button) to secure the vehicle.'
    },
    controls: {
      'Use the touchscreen': 'Access all vehicle settings and information from the main screen.',
      'Wipers & washers': 'Clean the windshield with the wiper button; cycle speeds or spray fluid as needed.',
      'Turn signals & lights': 'Signal your intentions using the stalk or steering‑yoke buttons.',
      'Steering wheel controls': 'Use the scroll wheels to adjust media, speed or Autopilot settings.'
    },
    autopilot: {
      'Enable Autopilot': 'Engage Autopilot or cruise control via the stalk or right scroll button.',
      'Adjust following distance': 'Set how closely your car follows the vehicle ahead.',
      'Use Navigate on Autopilot': 'Let the system suggest lane changes and exits on supported roads.',
      'Disable Autopilot safely': 'Press the brake or cancel button to return full control to the driver.'
    },
    charging: {
      'Open charge port': 'Tap the charge port door or press the button on the connector.',
      'Plug in the charger': 'Insert the connector firmly into the charge port until latched.',
      'Monitor charging': 'Check charge status and range on the touchscreen or app.'
    },
    phonekey: {
      'Download Tesla app': 'Get the Tesla app and log in with your Tesla account.',
      'Pair phone as key': 'Follow the app prompts to set up your phone as a key.',
      'Unlock and start with phone': 'Use the paired phone to lock/unlock and start the car.',
      'Remote control functions': 'Control climate, charge limits and more from your phone.'
    },
    climate: {
      'Adjust cabin temperature': 'Set desired temperature via the touchscreen or app.',
      'Use seat heaters': 'Warm the seats using the climate control menu.',
      'Defrost windshield': 'Clear ice or fog by selecting defrost mode.',
      'Activate Dog/Sentry mode': 'Keep pets comfortable or secure the car with these modes.'
    },
    delivery: {
      'Inspect exterior and interior': 'Check body panels, paint, and interior for any damage.',
      'Check VIN and paperwork': 'Ensure VIN on the car matches your documents.',
      'Pair key cards and phone': 'Activate key cards and set up your phone key.',
      'Verify software version': 'Confirm the vehicle is up to date via the software menu.'
    }
  };

  // --- Return model-specific step list ---
  function getCustomSteps(vehicle, sectionId) {
    const isStalkCar = vehicle === '3' || vehicle === 'Y';
    if (sectionId === 'drive') {
      return isStalkCar ? [
        'Start the car.',
        'Press the brake and move the drive stalk all the way down to shift into Drive.',
        'Accelerate and brake using the pedals.',
        'Use regenerative braking (release the accelerator to slow down).',
        'Press the button on the end of the drive stalk to put the car in Park.'
      ] : [
        'Start the car.',
        'Press the brake and swipe up on the drive‑mode strip on the touchscreen to shift into Drive.',
        'Accelerate and brake using the pedals.',
        'Use regenerative braking (release the accelerator to slow down).',
        'Tap “P” on the drive‑mode strip or press the Park button on the overhead console to park.'
      ];
    }
    if (sectionId === 'controls') {
      return isStalkCar ? [
        'Use the touchscreen to adjust settings and view vehicle information.',
        'Press the wiper button on the left stalk to wipe the windshield; each press cycles through speeds; hold it to spray washer fluid.',
        'Push the left stalk up or down (or tap the arrow buttons on the steering wheel on newer cars) to signal a turn; press again to cancel.',
        'Use the left scroll wheel on the steering wheel to adjust wiper speed or media volume.',
        'Use the right scroll wheel for Autopilot controls and media.'
      ] : [
        'Use the touchscreen to adjust settings and view vehicle information.',
        'Press the wiper button on the steering yoke; each press cycles through speeds; hold to spray washer fluid; adjust the speed by rolling the left scroll button.',
        'Press the turn‑signal buttons on the steering yoke to signal a turn; press again to cancel.',
        'Use the left scroll button to adjust wiper speed, mirrors or brightness.',
        'Use the right scroll button for Autopilot controls and media.'
      ];
    }
    if (sectionId === 'autopilot') {
      return isStalkCar ? [
        'Pull the right drive stalk down once to engage Traffic‑Aware Cruise Control.',
        'Pull the right drive stalk down twice quickly to engage Autosteer (Autopilot).',
        'Adjust the set speed or following distance using the right scroll wheel.',
        'To cancel Autopilot, push the drive stalk up once or press the brake pedal.'
      ] : [
        'Press the right scroll button on the steering yoke once to engage Traffic‑Aware Cruise Control.',
        'Press the right scroll button twice quickly to engage Autosteer (Autopilot).',
        'Adjust the set speed or following distance by rolling the right scroll button.',
        'To cancel Autopilot, press the right scroll button or press the brake pedal.'
      ];
    }
    const section = SECTIONS.find(s => s.id === sectionId);
    return section ? section.steps : [];
  }

  // --- Car hero images (Wikimedia) ---
  const CAR_IMAGES = {
    '3':  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Tesla_Model_3.jpg/960px-Tesla_Model_3.jpg',
    'Y':  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Tesla_Model_Y_(2025)_DSC_8297.jpg/1024px-Tesla_Model_Y_(2025)_DSC_8297.jpg',
    'S':  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Tesla_Model_S_2024_Blue.jpg/1024px-Tesla_Model_S_2024_Blue.jpg',
    'X':  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/2024_Tesla_Model_X.jpg/960px-2024_Tesla_Model_X.jpg',
    'CT': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Tesla_Cybertruck_(2024).jpg/1024px-Tesla_Cybertruck_(2024).jpg'
  };

  // --- AdSense component (replace with your own client and slot IDs) ---
  function AdSense() {
    useEffect(() => {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR_AD_CLIENT';
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
      return () => { document.body.removeChild(script); };
    }, []);
    return e('ins', {
      className: 'adsbygoogle',
      style: { display: 'block', margin: '24px 0' },
      'data-ad-client': 'YOUR_AD_CLIENT',
      'data-ad-slot': 'YOUR_AD_SLOT',
      'data-ad-format': 'auto',
      'data-full-width-responsive': 'true'
    });
  }

  // --- Referral banner for your referral code ---
  function ReferralBanner() {
    return e('div', {
      style: {
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #444',
        backgroundColor: '#111',
        marginTop: '32px',
        textAlign: 'center'
      }
    }, e('a', {
      href: 'https://ts.la/richard834858',
      target: '_blank',
      style: {
        color: '#2563eb',
        fontSize: '16px',
        textDecoration: 'none',
        fontWeight: '600'
      }
    }, 'Support us by using our Tesla referral code'));
  }

  // --- Section card on home page ---
  function Card({ section, onClick }) {
    return e('button', {
      onClick,
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #333',
        backgroundColor: '#111',
        color: '#fff',
        cursor: 'pointer'
      }
    }, [
      e('div', { style: { fontSize: '16px', fontWeight: '500' } }, section.title),
      e('div', { style: { fontSize: '20px', color: '#555' } }, '\u203A')
    ]);
  }

  // --- Home view with larger header, no tagline or footers ---
  function Home({ vehicle, setVehicle, setRoute }) {
    const statuses = ['Taking Delivery', 'Rental', 'Owner'];
    const imgSrc = CAR_IMAGES[vehicle];
    return e('div', null, [
      // Image
      e('div', { style: { marginBottom: '24px', width: '100%', textAlign: 'center' } },
        imgSrc ? e('img', { src: imgSrc, alt: 'Tesla', style: { maxWidth: '100%', borderRadius: '12px' } }) : null
      ),
      // Header
      e('div', { style: { letterSpacing: '0.2em', fontSize: '20px', color: '#888', textAlign: 'center', marginBottom: '12px' } }, 'Tesla Coach'),
      e('h2', { style: { fontSize: '32px', fontWeight: '600', marginBottom: '16px' } }, 'Drive a Tesla with Confidence'),
      // Selectors
      e('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' } }, [
        // Vehicle selector
        e('div', { style: { flex: '1' } }, [
          e('div', { style: { color: '#aaa', fontSize: '14px', marginBottom: '8px' } }, 'Which Tesla?'),
          e('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
            ['3','Y','S','X','CT'].map(v => {
              const label = v === '3' ? 'Model 3' : v === 'Y' ? 'Model Y' : v === 'S' ? 'Model S' : v === 'X' ? 'Model X' : 'Cybertruck';
              const active = v === vehicle;
              const bg = active ? (v === 'CT' ? '#dc2626' : '#2563eb') : '#333';
              return e('button', {
                key: v,
                onClick: () => setVehicle(v),
                style: {
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #444',
                  backgroundColor: bg,
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }
              }, label);
            })
          )
        ]),
        // Activity selector (placeholder)
        e('div', { style: { flex: '1' } }, [
          e('div', { style: { color: '#aaa', fontSize: '14px', marginBottom: '8px' } }, 'What are you doing today?'),
          e('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
            statuses.map((s, i) => {
              const active = i === 0;
              return e('button', {
                key: s,
                style: {
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid #444',
                  backgroundColor: active ? '#2563eb' : '#333',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }
              }, s);
            })
          )
        ])
      ]),
      // Section cards
      e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
        SECTIONS.map(sec => e(Card, { key: sec.id, section: sec, onClick: () => setRoute({ type: 'section', id: sec.id }) }))
      ),
      // AdSense and referral
      e(AdSense, null),
      e(ReferralBanner, null)
    ]);
  }

  // --- Section detail view ---
  function SectionDetail({ sectionId, vehicle, videoMap, setVideoUrl, resetVideoUrl, playlist, goBack }) {
    const [mode, setMode] = useState('steps');
    const sec = SECTIONS.find(s => s.id === sectionId);
    const steps = getCustomSteps(vehicle, sectionId);
    const descriptions = STEP_DESCRIPTIONS[sectionId] || {};

    function renderStepCards() {
      return e('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
        steps.map((title, index) =>
          e('div', {
            key: index,
            style: {
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#111',
              border: '1px solid #333'
            }
          }, [
            e('div', { style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px' } }, title),
            descriptions[title] ? e('div', { style: { fontSize: '14px', color: '#aaa', lineHeight: '1.4' } }, descriptions[title]) : null
          ])
        )
      );
    }

    return e('div', null, [
      e('button', {
        onClick: goBack,
        style: {
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid #444',
          backgroundColor: '#333',
          color: '#fff',
          cursor: 'pointer',
          marginBottom: '16px',
          fontSize: '14px'
        }
      }, '\u2039 Back'),
      e('h2', { style: { fontSize: '24px', fontWeight: '600', marginBottom: '16px' } }, sec.title),
      e('div', { style: { marginBottom: '16px' } },
        e(VideoPanel, { url: videoMap[sectionId] || '' })
      ),
      e('div', { style: { display: 'flex', gap: '8px', marginBottom: '12px' } }, [
        e('button', {
          style: {
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #444',
            backgroundColor: mode === 'steps' ? '#2563eb' : '#333',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer'
          },
          onClick: () => setMode('steps')
        }, 'Steps'),
        e('button', {
          style: {
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #444',
            backgroundColor: mode === 'video' ? '#2563eb' : '#333',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer'
          },
          onClick: () => setMode('video')
        }, 'Video')
      ]),
      mode === 'steps' ? renderStepCards() :
        e('div', null, [
          e(VideoPanel, { url: videoMap[sectionId] }),
          e(VideoEditor, {
            sectionId,
            current: videoMap[sectionId],
            onSave: url => setVideoUrl(sectionId, url),
            onReset: () => resetVideoUrl(sectionId),
            recommendations: playlist[sectionId]
          })
        ])
    ]);
  }

  // --- Main app router ---
  function App() {
    const [vehicle, setVehicle] = useLocalStorage('teslaHelper.vehicle', '3');
    const [videoMap, setVideoUrl, resetVideoUrl] = useVideoMap(vehicle);
    const playlists = useMemo(() => defaultPlaylist(vehicle), [vehicle]);
    const [route, setRoute] = useState({ type: 'home' });
    return e('div', {
      style: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '24px',
        color: '#fff',
        backgroundColor: '#000',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }
    },
      route.type === 'home'
        ? e(Home, { vehicle, setVehicle, setRoute })
        : e(SectionDetail, {
            sectionId: route.id,
            vehicle,
            videoMap,
            setVideoUrl,
            resetVideoUrl,
            playlist: playlists,
            goBack: () => setRoute({ type: 'home' })
          })
    );
  }

  // --- Render the app ---
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(e(App));
})();
