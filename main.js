(() => {
  const { useState, useEffect, useMemo } = React;
  const e = React.createElement;

  // Define all sections used in the app
  const SECTIONS = [
    { id:'quickstart', title:'Quick Start' },
    { id:'drive', title:'How to Drive' },
    { id:'controls', title:'Controls & Basics' },
    { id:'charging', title:'Charging' },
    { id:'autopilot', title:'Autopilot & Safety' },
    { id:'phonekey', title:'Phone as Key / App' },
    { id:'climate', title:'Climate & Defrost' },
    { id:'delivery', title:'Delivery Checklist' }
  ];

  // Map a vehicle → default video URL per section.
  // Use official Tesla links wherever possible.
  function defaultVideoMap(vehicle) {
    // Helper to return a common mapping for Models 3 and Y
    const map3 = {
      quickstart:'https://www.tesla.com/support/videos/watch/essentials-meet-your-model-3',
      drive:'https://www.tesla.com/support/videos/watch/physical-controls-meet-your-model-3',
      controls:'https://www.tesla.com/support/videos/watch/touchscreen-meet-your-model-3',
      charging:'https://www.tesla.com/support/videos/watch/charging-meet-your-model-3',
      autopilot:'https://www.tesla.com/support/videos/watch/autopilot-meet-your-model-3',
      phonekey:'https://www.tesla.com/support/videos/watch/vehicle-controls-tesla-app',
      climate:'https://www.tesla.com/support/videos/watch/touchscreen-meet-your-model-3',
      delivery:'https://www.tesla.com/support/videos/watch/essentials-meet-your-model-3'
    };
    // Base mapping for Model S
    const mapS = {
      quickstart:'https://www.tesla.com/support/videos/watch/essentials-meet-your-model-s',
      drive:'https://www.tesla.com/support/videos/watch/driver-controls-model-s',
      controls:'https://www.tesla.com/support/videos/watch/physical-controls-model-s',
      charging:'https://www.tesla.com/support/videos/watch/charging-meet-your-model-s',
      autopilot:'https://www.tesla.com/support/videos/watch/fsd-supervised-model-s',
      phonekey:'https://www.tesla.com/support/videos/watch/tesla-app-model-s',
      climate:'https://www.tesla.com/support/videos/watch/physical-controls-model-s',
      delivery:'https://www.tesla.com/support/videos/watch/essentials-meet-your-model-s'
    };
    // Base mapping for Model X
    const mapX = {
      quickstart:'https://www.tesla.com/support/videos/watch/essentials-meet-your-model-x',
      drive:'https://www.youtube.com/watch?v=ACTNNhdh_0g', // physical controls S/X combined
      controls:'https://www.tesla.com/support/videos/watch/auto-lane-change-model-s-and-model-x',
      charging:'https://www.tesla.com/support/videos/watch/charging-meet-your-model-x',
      autopilot:'https://www.tesla.com/support/videos/watch/fsd-supervised-model-s', // FSD supervised also for X
      phonekey:'https://www.tesla.com/support/videos/watch/vehicle-controls-tesla-app',
      climate:'https://www.youtube.com/watch?v=ACTNNhdh_0g',
      delivery:'https://www.tesla.com/support/videos/watch/essentials-meet-your-model-x'
    };
    // Base mapping for Cybertruck (fallback to Y where missing)
    const mapCT = {
      quickstart:'https://www.tesla.com/support/videos/watch/access-cybertruck',
      drive:'https://www.tesla.com/support/videos/watch/driver-controls-cybertruck',
      controls:'https://www.tesla.com/support/videos/watch/driver-controls-cybertruck',
      charging:'https://www.tesla.com/support/videos/watch/charging-meet-your-model-3', // fallback
      autopilot:'https://www.tesla.com/support/videos/watch/fsd-supervised-cybertruck',
      phonekey:'https://www.tesla.com/support/videos/watch/tesla-app-cybertruck',
      climate:'https://www.tesla.com/support/videos/watch/driver-controls-cybertruck',
      delivery:'https://www.tesla.com/support/videos/watch/access-cybertruck'
    };
    // Return by vehicle
    if (vehicle === '3' || vehicle === 'Y') return map3;
    if (vehicle === 'S') return mapS;
    if (vehicle === 'X') return mapX;
    if (vehicle === 'CT') return mapCT;
    return map3; // fallback
  }

  // Build a playlist for each section and model. Each array contains {title,url}.
  function defaultPlaylist(vehicle) {
    const base = defaultVideoMap(vehicle);
    // Example: we pick a few top videos per section based on the list provided.
    return {
      quickstart: [
        { title:'Essentials / First Drive', url: base.quickstart },
        { title:'Driver Profiles', url: vehicle === 'S' ? 'https://www.tesla.com/support/videos/watch/driver-profiles-model-s' :
                                vehicle === '3' ? 'https://www.tesla.com/support/videos/watch/driver-profiles-model-3' :
                                vehicle === 'X' ? 'https://www.tesla.com/support/videos/watch/driver-profiles-model-x' :
                                'https://www.tesla.com/support/videos/watch/driver-profiles-cybertruck' }
      ],
      drive: [
        { title:'Driver Controls', url: base.drive },
        { title:'Personalization', url: vehicle === 'S' ? 'https://www.tesla.com/support/videos/watch/personalization-meet-your-model-s' :
                                vehicle === 'X' ? 'https://www.tesla.com/support/videos/watch/personalization-meet-your-model-x' :
                                base.drive }
      ],
      controls: [
        { title:'Physical / Touchscreen Controls', url: base.controls },
        { title:'Displays', url: vehicle === 'S' ? 'https://www.tesla.com/support/videos/watch/screens-displays-model-s' :
                                vehicle === 'X' ? 'https://www.tesla.com/support/videos/watch/displays-model-s-and-model-x' :
                                base.controls }
      ],
      charging: [
        { title:'Charging Basics', url: base.charging },
        { title:'Charge Stats in App', url:'https://www.tesla.com/support/videos/watch/vehicle-charge-stats' }
      ],
      autopilot: [
        { title:'Autopilot / FSD', url: base.autopilot },
        { title:'Autosteer Activation', url:'https://www.tesla.com/support/videos/watch/autosteer-activation-settings-model-s-and-model-x' },
        { title:'Auto Lane Change', url:'https://www.tesla.com/support/videos/watch/auto-lane-change-model-s-and-model-x' }
      ],
      phonekey: [
        { title:'Tesla App Overview', url: base.phonekey },
        { title:'Vehicle Controls via App', url:'https://www.tesla.com/support/videos/watch/vehicle-controls-tesla-app' }
      ],
      climate: [
        { title:'Climate via Controls', url: base.climate }
      ],
      delivery: [
        { title:'First Drive / Essentials', url: base.delivery },
        { title:'Closing the Frunk', url:'https://www.tesla.com/support/videos/watch/closing-front-trunk-model-s-model-x' }
      ]
    };
  }

  // Local storage hook
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
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }, [key, value]);
    return [value, setValue];
  }

  // Persist video choices per vehicle
  function useVideoMap(vehicle) {
    const [maps, setMaps] = useLocalStorage('teslaHelper.videos', {});
    const map = maps[vehicle] || defaultVideoMap(vehicle);
    const setUrl = (id, url) => {
      setMaps({...maps, [vehicle]: {...map, [id]: url}});
    };
    const resetUrl = (id) => {
      const defaults = defaultVideoMap(vehicle);
      setMaps({...maps, [vehicle]: {...map, [id]: defaults[id] || ''}});
    };
    return [map, setUrl, resetUrl];
  }

  // Convert YouTube/Vimeo URLs to embed
  function embedUrlFromInput(url) {
    if (!url) return '';
    try {
      const vimeo = url.match(/^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/);
      if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
      const yt = url.match(/^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    } catch {}
    return url;
  }

  // Display video (MP4, YouTube, or Vimeo)
  function VideoPanel({ url }) {
    if (!url) return null;
    if (/\.mp4(\?|$)/.test(url)) {
      return e('video', { controls:true, src:url, crossOrigin:'anonymous', style:{width:'100%',borderRadius:'8px'} });
    }
    const src = embedUrlFromInput(url);
    return e('iframe', {
      src,
      allow:'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowFullScreen:true,
      style:{width:'100%',height:'360px',border:'none',borderRadius:'8px'}
    });
  }

  // Video URL editor
  function VideoEditor({ sectionId, current, onSave, onReset, recommendations }) {
    const [value,setValue] = useState(current || '');
    useEffect(() => setValue(current || ''), [current]);
    return e('div', null, [
      e('input', {
        value,
        onChange: ev => setValue(ev.target.value),
        placeholder:'Paste YouTube/Vimeo/MP4 link',
        style:{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #444',backgroundColor:'#111',color:'#eee',marginBottom:'8px'}
      }),
      e('div', { style:{display:'flex',gap:'8px',marginBottom:'8px'} }, [
        e('button',{ onClick:() => onSave(value || ''), style:{padding:'6px 12px',borderRadius:'6px',border:'1px solid #555',backgroundColor:'#333',color:'#fff',fontSize:'12px',cursor:'pointer'}},'Save'),
        e('button',{ onClick:onReset, style:{padding:'6px 12px',borderRadius:'6px',border:'1px solid #555',backgroundColor:'#333',color:'#fff',fontSize:'12px',cursor:'pointer'}},'Use Default')
      ]),
      recommendations?.length ? e('div', null, [
        e('div', { style:{fontSize:'12px',color:'#888',marginBottom:'4px'} }, 'Recommended Playlist'),
        ...recommendations.map((rec,i) =>
          e('div',{ key:i, onClick:() => onSave(rec.url), style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px',borderRadius:'6px',border:'1px solid #444',backgroundColor:'#222',marginBottom:'4px',cursor:'pointer'}},[
            e('div', null, [
              e('div',{ style:{color:'#eee',fontSize:'14px'} }, rec.title),
              e('div',{ style:{color:'#666',fontSize:'10px',wordBreak:'break-all'} }, rec.url)
            ]),
            e('span',{ style:{color:'#888',fontSize:'12px'} }, 'Use')
          ])
        )
      ]) : null
    ]);
  }

  // Model-specific descriptive steps
  function getCustomSteps(vehicle, sectionId) {
    const isStalk = vehicle === '3' || vehicle === 'Y';
    if (sectionId === 'drive') {
      return isStalk
        ? ['Start the car.','Press the brake and move the drive stalk all the way down to shift into Drive.','Accelerate and brake using the pedals.','Use regenerative braking (release the accelerator to slow down).','Press the button on the end of the drive stalk to put the car in Park.']
        : ['Start the car.','Press the brake and swipe up on the drive‑mode strip on the touchscreen to shift into Drive.','Accelerate and brake using the pedals.','Use regenerative braking (release the accelerator to slow down).','Tap “P” on the drive‑mode strip or press the Park button on the overhead console to park.'];
    }
    if (sectionId === 'controls') {
      return isStalk
        ? ['Use the touchscreen to adjust settings and view vehicle information.','Press the wiper button on the left stalk to wipe; each press cycles speeds; hold to spray washer fluid.','Push the left stalk up/down (or tap arrow buttons) to signal; press again to cancel.','Use the left scroll wheel to adjust wiper speed or media volume.','Use the right scroll wheel for Autopilot controls and media.']
        : ['Use the touchscreen to adjust settings and view vehicle information.','Press the wiper button on the steering yoke; each press cycles speeds; hold to spray; adjust speed via left scroll button.','Press the turn‑signal buttons on the steering yoke to signal; press again to cancel.','Use the left scroll button to adjust wiper speed, mirrors or brightness.','Use the right scroll button for Autopilot controls and media.'];
    }
    if (sectionId === 'autopilot') {
      return isStalk
        ? ['Pull the right drive stalk down once for Traffic‑Aware Cruise Control.','Pull the right drive stalk down twice quickly for Autosteer (Autopilot).','Adjust speed/follow distance using the right scroll wheel.','To cancel, push the drive stalk up once or press the brake pedal.']
        : ['Press the right scroll button once for Traffic‑Aware Cruise Control.','Press the right scroll button twice quickly for Autosteer (Autopilot).','Adjust speed/follow distance by rolling the right scroll button.','To cancel, press the right scroll button or press the brake pedal.'];
    }
    // Default: return base steps (like climate/delivery)
    const sec = SECTIONS.find(s => s.id === sectionId);
    return sec ? sec.steps : [];
  }

  // Image library per model
  const CAR_IMAGES = {
    '3':'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Tesla_Model_3.jpg/960px-Tesla_Model_3.jpg',
    'Y':'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Tesla_Model_Y_(2025)_DSC_8297.jpg/1024px-Tesla_Model_Y_(2025)_DSC_8297.jpg',
    'S':'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Tesla_Model_S_2024_Blue.jpg/1024px-Tesla_Model_S_2024_Blue.jpg',
    'X':'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/2024_Tesla_Model_X.jpg/960px-2024_Tesla_Model_X.jpg',
    'CT':'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Tesla_Cybertruck_(2024).jpg/1024px-Tesla_Cybertruck_(2024).jpg'
  };

  // Google AdSense placeholder (replace your IDs)
  function AdSense() {
    useEffect(() => {
      const script=document.createElement('script');
      script.async=true;
      script.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR_AD_CLIENT';
      script.crossOrigin='anonymous';
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    }, []);
    return e('ins',{
      className:'adsbygoogle',
      style:{display:'block',margin:'24px 0'},
      'data-ad-client':'YOUR_AD_CLIENT',
      'data-ad-slot':'YOUR_AD_SLOT',
      'data-ad-format':'auto',
      'data-full-width-responsive':'true'
    });
  }

  // Referral banner linking to your referral code
  function ReferralBanner() {
    return e('div',{ style:{padding:'12px',borderRadius:'8px',border:'1px solid #444',backgroundColor:'#111',marginTop:'32px',textAlign:'center'} },
      e('a',{ href:'https://ts.la/richard834858', target:'_blank', style:{color:'#2563eb',fontSize:'16px',textDecoration:'none',fontWeight:'600'} },'Support us by using our Tesla referral code')
    );
  }

  // Card component on home page
  function Card({ section, onClick }) {
    return e('button',{
      onClick,
      style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px',borderRadius:'12px',border:'1px solid #333',backgroundColor:'#111',color:'#fff',cursor:'pointer'}
    },[
      e('div',{ style:{fontSize:'16px',fontWeight:'500'} }, section.title),
      e('div',{ style:{fontSize:'20px',color:'#555'} }, '\u203A')
    ]);
  }

  // Home page: choose model, show hero image, list sections
  function Home({ vehicle,setVehicle,setRoute }) {
    const statuses=['Taking Delivery','Rental','Owner'];
    const imgSrc = CAR_IMAGES[vehicle];
    return e('div', null, [
      e('div', {style:{marginBottom:'24px',width:'100%',textAlign:'center'}},
        imgSrc ? e('img',{src:imgSrc,alt:'Tesla',style:{maxWidth:'100%',borderRadius:'12px'}}) : null
      ),
      e('div',{style:{letterSpacing:'0.2em',fontSize:'20px',color:'#888',textAlign:'center',marginBottom:'12px'}}, 'Tesla Coach'),
      e('h2',{ style:{fontSize:'32px',fontWeight:'600',marginBottom:'16px'}}, 'Drive a Tesla with Confidence'),
      e('div',{ style:{display:'flex',flexWrap:'wrap',gap:'16px',marginBottom:'24px'} },[
        e('div',{ style:{flex:'1'} },[
          e('div',{ style:{color:'#aaa',fontSize:'14px',marginBottom:'8px'}}, 'Which Tesla?'),
          e('div',{ style:{display:'flex',flexWrap:'wrap',gap:'8px'} },
            ['3','Y','S','X','CT'].map(v => {
              const label = v==='3'?'Model 3':v==='Y'?'Model Y':v==='S'?'Model S':v==='X'?'Model X':'Cybertruck';
              const active = (v === vehicle);
              const bg = active ? (v === 'CT' ? '#dc2626' : '#2563eb') : '#333';
              return e('button',{ key:v,onClick:() => setVehicle(v), style:{padding:'6px 12px',borderRadius:'20px',border:'1px solid #444',backgroundColor:bg,color:'#fff',fontSize:'14px',cursor:'pointer'} }, label);
            })
          )
        ]),
        e('div',{ style:{flex:'1'} },[
          e('div',{ style:{color:'#aaa',fontSize:'14px',marginBottom:'8px'} }, 'What are you doing today?'),
          e('div',{ style:{display:'flex',flexWrap:'wrap',gap:'8px'} },
            statuses.map((s,i) => {
              const active = (i === 0);
              return e('button',{ key:s, style:{padding:'6px 12px',borderRadius:'20px',border:'1px solid #444',backgroundColor: active ? '#2563eb' : '#333',color:'#fff',fontSize:'14px',cursor:'pointer'} }, s);
            })
          )
        ])
      ]),
      e('div',{ style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'} },
        SECTIONS.map(sec => e(Card,{ key:sec.id,section:sec,onClick:() => setRoute({type:'section',id:sec.id}) }))
      ),
      e(AdSense,null),
      e(ReferralBanner,null)
    ]);
  }

  // Section detail page: show hero video, tabs for steps/video
  function SectionDetail({ sectionId, vehicle, videoMap, setVideoUrl, resetVideoUrl, playlist, goBack }) {
    const [mode,setMode] = useState('steps');
    const sec = SECTIONS.find(s => s.id === sectionId);
    const steps = getCustomSteps(vehicle, sectionId);
    const descriptions = STEP_DESCRIPTIONS[sectionId] || {};
    function renderCards() {
      return e('div',{ style:{display:'flex',flexDirection:'column',gap:'16px'} },
        steps.map((title,index) =>
          e('div',{ key:index, style:{padding:'16px',borderRadius:'12px',backgroundColor:'#111',border:'1px solid #333'} },[
            e('div',{ style:{fontSize:'18px',fontWeight:'600',marginBottom:'8px'} }, title),
            descriptions[title] ? e('div',{ style:{fontSize:'14px',color:'#aaa',lineHeight:'1.4'} }, descriptions[title]) : null
          ])
        )
      );
    }
    return e('div', null, [
      e('button',{ onClick:goBack, style:{padding:'6px 12px',borderRadius:'6px',border:'1px solid #444',backgroundColor:'#333',color:'#fff',cursor:'pointer',marginBottom:'16px',fontSize:'14px'}},'\u2039 Back'),
      e('h2',{ style:{fontSize:'24px',fontWeight:'600',marginBottom:'16px'}}, sec.title),
      e('div',{ style:{marginBottom:'16px'} }, e(VideoPanel,{ url: videoMap[sectionId] || '' })),
      e('div',{ style:{display:'flex',gap:'8px',marginBottom:'12px'} }, [
        e('button',{ style:{padding:'6px 12px',borderRadius:'6px',border:'1px solid #444',backgroundColor:(mode==='steps')?'#2563eb':'#333',color:'#fff',fontSize:'14px',cursor:'pointer'}, onClick:() => setMode('steps')}, 'Steps'),
        e('button',{ style:{padding:'6px 12px',borderRadius:'6px',border:'1px solid #444',backgroundColor:(mode==='video')?'#2563eb':'#333',color:'#fff',fontSize:'14px',cursor:'pointer'}, onClick:() => setMode('video')}, 'Video')
      ]),
      mode === 'steps' ? renderCards() :
        e('div', null, [
          e(VideoPanel,{ url: videoMap[sectionId] }),
          e(VideoEditor,{ sectionId,current:videoMap[sectionId],onSave:url => setVideoUrl(sectionId,url),onReset:() => resetVideoUrl(sectionId),recommendations: playlist[sectionId] })
        ])
    ]);
  }

  // App router
  function App() {
    const [vehicle,setVehicle] = useLocalStorage('teslaHelper.vehicle','3');
    const [videoMap,setVideoUrl,resetVideoUrl] = useVideoMap(vehicle);
    const playlists = useMemo(() => defaultPlaylist(vehicle), [vehicle]);
    const [route,setRoute] = useState({ type:'home' });
    return e('div',{ style:{maxWidth:'900px',margin:'0 auto',padding:'24px',color:'#fff',backgroundColor:'#000',minHeight:'100vh',fontFamily:'Arial, sans-serif'} },
      route.type==='home'
        ? e(Home,{ vehicle,setVehicle,setRoute })
        : e(SectionDetail,{ sectionId:route.id, vehicle, videoMap, setVideoUrl, resetVideoUrl, playlist:playlists, goBack:() => setRoute({type:'home'}) })
    );
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(e(App));
})();
