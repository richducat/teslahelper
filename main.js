(() => {
  const { useState, useEffect, useMemo } = React;
  const e = React.createElement;

  // Section definitions
  const SECTIONS = [
    { id:'quickstart', title:'Quick Start', steps:['Adjust your seat','Adjust mirrors','Fasten seatbelt','Select drive mode','Press brake to start'] },
    { id:'drive', title:'How to Drive', steps:['Start the car','Shift into Drive','Accelerate and brake','Regenerative braking','Park the car'] },
    { id:'controls', title:'Controls & Basics', steps:['Use the touchscreen','Wipers & washers','Turn signals & lights','Steering wheel controls'] },
    { id:'charging', title:'Charging', steps:['Open charge port','Plug in the charger','Monitor charging'] },
    { id:'autopilot', title:'Autopilot & Safety', steps:['Enable Autopilot','Adjust following distance','Use Navigate on Autopilot','Disable Autopilot safely'] },
    { id:'phonekey', title:'Phone as Key / App', steps:['Download Tesla app','Pair phone as key','Unlock and start with phone','Remote control functions'] },
    { id:'climate', title:'Climate & Defrost', steps:['Adjust cabin temperature','Use seat heaters','Defrost windshield','Activate Dog/Sentry mode'] },
    { id:'delivery', title:'Delivery Checklist', steps:['Inspect exterior and interior','Check VIN and paperwork','Pair key cards and phone','Verify software version'] },
  ];

  // Default videos by model
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

  // Playlists per section
  function defaultPlaylist(vehicle) {
    const map = defaultVideoMap(vehicle);
    return {
      quickstart: [
        { title:'Essentials / First Drive', url: map.quickstart },
        { title:'Driver Profiles', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Driver-Profiles_3Y_MYT_Video.mp4' }
      ],
      drive: [
        { title:'Physical Controls', url: map.drive },
        { title:'Wipers', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Wipers_3Y_MYT_Video.mp4' }
      ],
      controls: [
        { title:'Touchscreen Overview', url: map.controls },
        { title:'Customize Controls', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Customize-Controls_3Y_MYT_Video.mp4' }
      ],
      charging: [
        { title:'Charging Basics', url: map.charging },
        { title:'Trip Planner', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Trip-Planner_3Y_MYT_Video.mp4' }
      ],
      autopilot: [
        { title:'Autopilot Basics', url: map.autopilot },
        { title:'Navigate on Autopilot', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Navigate-on-Autopilot_3Y_MYT_Video.mp4' }
      ],
      phonekey: [
        { title:'Tesla App Vehicle Controls', url: map.phonekey },
        { title:'Phone Key Setup', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Phone-Key_3Y_MYT_Video.mp4' }
      ],
      climate: [
        { title:'Climate on Touchscreen', url: map.climate },
        { title:'Cabin Overheat', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Cabin-Overheat_3Y_MYT_Video.mp4' }
      ],
      delivery: [
        { title:'Essentials / First Drive', url: map.delivery },
        { title:'Keys & Cards', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Keys_3Y_MYT_Video.mp4' }
      ]
    };
  }

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

  // Manage per-vehicle video selections
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

  // Convert YouTube/Vimeo URLs to embed URLs
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

  // Video display
  function VideoPanel({ url }) {
    if (!url) return null;
    const isMp4 = /\.mp4(\?|$)/.test(url);
    if (isMp4) {
      return e('video', { controls:true, src:url, style:{ width:'100%', borderRadius:'8px' } });
    }
    const src = embedUrlFromInput(url);
    return e('iframe', {
      src,
      allow:'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowFullScreen:true,
      style:{ width:'100%', height:'360px', borderRadius:'8px', border:'none' }
    });
  }

  // Video URL editor
  function VideoEditor({ sectionId, current, onSave, onReset, recommendations }) {
    const [value, setValue] = useState(current || '');
    useEffect(() => setValue(current || ''), [current]);
    return e('div', null, [
      e('input', {
        value,
        onChange: ev => setValue(ev.target.value),
        placeholder:'Paste YouTube/Vimeo/MP4 link for this section',
        style:{ width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #444', backgroundColor:'#111', color:'#eee', marginBottom:'8px' }
      }),
      e('div', { style:{ display:'flex', gap:'8px', marginBottom:'8px' } }, [
        e('button', { onClick:() => onSave(value || ''), style:{ padding:'6px 12px', borderRadius:'6px', border:'1px solid #555', backgroundColor:'#333', color:'#fff', cursor:'pointer' } }, 'Save Video'),
        e('button', { onClick:onReset, style:{ padding:'6px 12px', borderRadius:'6px', border:'1px solid #555', backgroundColor:'#333', color:'#fff', cursor:'pointer' } }, 'Use Recommended')
      ]),
      (recommendations && recommendations.length) ? e('div', null, [
        e('div', { style:{ fontSize:'12px', color:'#888', marginBottom:'4px' } }, 'Recommended Playlist'),
        ...recommendations.map((rec, i) =>
          e('div', {
            key:i,
            onClick: () => onSave(rec.url),
            style:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px', borderRadius:'6px', border:'1px solid #444', backgroundColor:'#222', marginBottom:'4px', cursor:'pointer' }
          }, [
            e('div', null, [
              e('div', { style:{ color:'#eee', fontSize:'14px' } }, rec.title),
              e('div', { style:{ color:'#666', fontSize:'10px', wordBreak:'break-all' } }, rec.url)
            ]),
            e('span', { style:{ color:'#888', fontSize:'12px' } }, 'Use')
          ])
        )
      ]) : null
    ]);
  }

  // Section component
  function Section({ section, videoUrl, onSaveVideo, onResetVideo, playlist }) {
    const [mode, setMode] = useState('steps');
    const makeTabStyle = (active) => ({
      padding:'4px 8px',
      borderRadius:'6px',
      border:'1px solid #555',
      backgroundColor: active ? '#2563eb' : '#333',
      color:'#fff',
      fontSize:'12px',
      cursor:'pointer',
      marginRight:'4px'
    });
    return e('div', { style:{ marginBottom:'32px' } }, [
      e('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' } }, [
        e('div', { style:{ fontSize:'18px', fontWeight:'600' } }, section.title),
        e('div', null, [
          e('button', { style: makeTabStyle(mode === 'steps'), onClick:() => setMode('steps') }, 'Steps'),
          e('button', { style: makeTabStyle(mode === 'video'), onClick:() => setMode('video') }, 'Video')
        ])
      ]),
      mode === 'steps'
        ? e('ul', { style:{ listStyleType:'disc', paddingLeft:'20px', marginBottom:'8px', color:'#ccc' } },
            section.steps.map((st, i) => e('li', { key:i, style:{ marginBottom:'4px' } }, st))
          )
        : e('div', null, [
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

  // Main app
  function App() {
    const VEHICLES = ['3','Y','S','X','CT'];
    const [vehicle, setVehicle] = useLocalStorage('teslaHelper.vehicle','3');
    const [videoMap, setVideoUrl, resetVideoUrl] = useVideoMap(vehicle);
    const playlists = useMemo(() => defaultPlaylist(vehicle), [vehicle]);

    return e('div', { style:{ maxWidth:'42rem', margin:'0 auto', padding:'16px', color:'#fff', backgroundColor:'#000', minHeight:'100vh' } }, [
      e('h1', { style:{ fontSize:'24px', fontWeight:'bold', marginBottom:'16px' } }, 'Tesla Helper'),
      e('div', { style:{ display:'flex', gap:'8px', marginBottom:'24px' } },
        VEHICLES.map(v => {
          const label = v==='3' ? 'Model 3' : v==='Y' ? 'Model Y' : v==='S' ? 'Model S' : v==='X' ? 'Model X' : 'Model CT';
          const isActive = v === vehicle;
          const background = isActive ? (v==='CT' ? '#dc2626' : '#2563eb') : '#333';
          return e('button', {
            key:v,
            onClick:() => setVehicle(v),
            style:{ padding:'4px 8px', borderRadius:'6px', border:'1px solid #555', backgroundColor: background, color:'#fff', fontSize:'12px', cursor:'pointer' }
          }, label);
        })
      ),
      ...SECTIONS.map(sec =>
        e(Section, {
          key: sec.id,
          section: sec,
          videoUrl: videoMap[sec.id],
          onSaveVideo: (id,url) => setVideoUrl(id,url),
          onResetVideo: id => resetVideoUrl(id),
          playlist: playlists[sec.id] || []
        })
      )
    ]);
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(e(App));
})();
