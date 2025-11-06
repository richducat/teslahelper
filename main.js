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

  // Default videos per model
  function defaultVideoMap(vehicle) {
    const base = {
      quickstart:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Essentials_MYT.mp4',
      drive:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Physical-Controls_3Y_MYT_Video.mp4',
      controls:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Touchscreen_3Y_MYT_Video.mp4',
      charging:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Charging_3Y_MYT_Video.mp4',
      autopilot:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Autopilot_3Y_MYT_Video.mp4',
      phonekey:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Tesla-App-Vehicle-Controls_All_Video.mp4',
      climate:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Touchscreen_3Y_MYT_Video.mp4',
      delivery:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Essentials_MYT.mp4'
    };
    if (vehicle === 'S' || vehicle === 'X') {
      base.drive = 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Physical-Controls_SX_MYT_Video.mp4';
      base.controls = 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Touchscreen_SX_MYT_Video.mp4';
    }
    if (vehicle === 'CT') {
      base.drive = base.drive || 'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Physical-Controls_3Y_MYT_Video.mp4';
    }
    return base;
  }

  // Recommended playlists
  function defaultPlaylist(vehicle) {
    const m = defaultVideoMap(vehicle);
    return {
      quickstart:[{ title:'Essentials / First Drive', url:m.quickstart }, { title:'Driver Profiles', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Driver-Profiles_3Y_MYT_Video.mp4' }],
      drive:[{ title:'Physical Controls', url:m.drive }, { title:'Wipers', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Wipers_3Y_MYT_Video.mp4' }],
      controls:[{ title:'Touchscreen Overview', url:m.controls }, { title:'Customize Controls', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Customize-Controls_3Y_MYT_Video.mp4' }],
      charging:[{ title:'Charging Basics', url:m.charging }, { title:'Trip Planner', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Trip-Planner_3Y_MYT_Video.mp4' }],
      autopilot:[{ title:'Autopilot Basics', url:m.autopilot }, { title:'Navigate on Autopilot', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Navigate-on-Autopilot_3Y_MYT_Video.mp4' }],
      phonekey:[{ title:'Tesla App Vehicle Controls', url:m.phonekey }, { title:'Phone Key Setup', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Phone-Key_3Y_MYT_Video.mp4' }],
      climate:[{ title:'Climate on Touchscreen', url:m.climate }, { title:'Cabin Overheat', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Cabin-Overheat_3Y_MYT_Video.mp4' }],
      delivery:[{ title:'Essentials / First Drive', url:m.delivery }, { title:'Keys & Cards', url:'https://digitalassets.tesla.com/tesla-contents/video/upload/f_auto,q_auto:best/Keys_3Y_MYT_Video.mp4' }]
    };
  }

  // Persisted state
  function useLocalStorage(key, initial) {
    const [value, setValue] = useState(() => {
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initial;
      } catch { return initial; }
    });
    useEffect(() => {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }, [key, value]);
    return [value, setValue];
  }

  // Manage video URLs per vehicle
  function useVideoMap(vehicle) {
    const [maps, setMaps] = useLocalStorage('teslaHelper.videos', {});
    const map = maps[vehicle] || defaultVideoMap(vehicle);
    const setUrl = (id, url) => {
      setMaps(Object.assign({}, maps, { [vehicle]: Object.assign({}, map, { [id]: url }) }));
    };
    const resetUrl = id => {
      const defaults = defaultVideoMap(vehicle);
      setMaps(Object.assign({}, maps, { [vehicle]: Object.assign({}, map, { [id]: defaults[id] || '' }) }));
    };
    return [map, setUrl, resetUrl];
  }

  // Convert user URL to embed
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

  // Video container
  function VideoPanel({ url }) {
    if (!url) return null;
    const isMp4 = /\.mp4(\?|$)/.test(url);
    if (isMp4) {
      return e('video',{controls:true,src:url,style:{width:'100%',borderRadius:'8px'}});
    }
    const src = embedUrlFromInput(url);
    return e('iframe',{
      src,
      allow:'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
      allowFullScreen:true,
      style:{width:'100%',height:'360px',borderRadius:'8px',border:'none'}
    });
  }

  // Editor for custom videos
  function VideoEditor({ sectionId, current, onSave, onReset, recommendations }) {
    const [value,setValue] = useState(current || '');
    useEffect(() => setValue(current || ''), [current]);
    return e('div',null,[
      e('input',{
        value,
        onChange:ev => setValue(ev.target.value),
        placeholder:'Paste YouTube/Vimeo/MP4 link for this section',
        style:{width:'100%',padding:'8px',borderRadius:'6px',border:'1px solid #444',backgroundColor:'#111',color:'#eee',marginBottom:'8px'}
      }),
      e('div',{style:{display:'flex',gap:'8px',marginBottom:'8px'}},[
        e('button',{onClick:() => onSave(value || ''),style:{padding:'6px 12px',borderRadius:'6px',border:'1px solid #555',backgroundColor:'#333',color:'#fff',cursor:'pointer',fontSize:'12px'}},'Save Video'),
        e('button',{onClick:onReset,style:{padding:'6px 12px',borderRadius:'6px',border:'1px solid #555',backgroundColor:'#333',color:'#fff',cursor:'pointer',fontSize:'12px'}},'Use Recommended')
      ]),
      recommendations && recommendations.length
        ? e('div',null,[
            e('div',{style:{fontSize:'12px',color:'#888',marginBottom:'4px'}},'Recommended Playlist'),
            ...recommendations.map((rec,i) =>
              e('div',{
                key:i,
                onClick:() => onSave(rec.url),
                style:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px',borderRadius:'6px',border:'1px solid #444',backgroundColor:'#222',marginBottom:'4px',cursor:'pointer'}
              },[
                e('div',null,[
                  e('div',{style:{color:'#eee',fontSize:'14px'}},rec.title),
                  e('div',{style:{color:'#666',fontSize:'10px',wordBreak:'break-all'}},rec.url)
                ]),
                e('span',{style:{color:'#888',fontSize:'12px'}},'Use')
              ])
            )
          ])
        : null
    ]);
  }

  // Card for section on home page
  function Card({ section, onClick }) {
    return e('button',{
      onClick,
      style:{
        display:'flex',justifyContent:'space-between',alignItems:'center',
        padding:'16px',borderRadius:'12px',border:'1px solid #333',
        backgroundColor:'#111',color:'#fff',cursor:'pointer'
      }
    },[
      e('div',{style:{fontSize:'16px',fontWeight:'500'}},section.title),
      e('div',{style:{fontSize:'20px',color:'#555'}},'\u203A')  // › symbol
    ]);
  }

  // Home view
  function Home({ vehicle,setVehicle,setRoute }) {
    const statuses = ['Taking Delivery','Rental','Owner'];
    return e('div',null,[
      e('div',{style:{letterSpacing:'0.2em',fontSize:'14px',color:'#888',textAlign:'center',marginBottom:'16px'}},'Tesla Coach'),
      e('h2',{style:{fontSize:'28px',fontWeight:'600',marginBottom:'8px'}},'Drive a Tesla with Confidence'),
      e('p',{style:{color:'#888',marginBottom:'24px'}},'Clear steps. Big buttons. Read‑aloud guidance. Now with videos.'),
      // Vehicle and activity selectors
      e('div',{style:{display:'flex',flexWrap:'wrap',gap:'16px',marginBottom:'24px'}},[
        // Vehicle selector
        e('div',{style:{flex:'1'}},[
          e('div',{style:{color:'#aaa',fontSize:'14px',marginBottom:'8px'}},'Which Tesla?'),
          e('div',{style:{display:'flex',flexWrap:'wrap',gap:'8px'}},
            ['3','Y','S','X','CT'].map(v => {
              const label = v==='3'?'Model 3':v==='Y'?'Model Y':v==='S'?'Model S':v==='X'?'Model X':'Cybertruck';
              const active = v===vehicle;
              const bg = active ? (v==='CT' ? '#dc2626' : '#2563eb') : '#333';
              return e('button',{
                key:v,
                onClick:() => setVehicle(v),
                style:{padding:'6px 12px',borderRadius:'20px',border:'1px solid #444',backgroundColor:bg,color:'#fff',fontSize:'14px',cursor:'pointer'}
              },label);
            })
          )
        ]),
        // Activity selector (placeholder, not persisted)
        e('div',{style:{flex:'1'}},[
          e('div',{style:{color:'#aaa',fontSize:'14px',marginBottom:'8px'}},'What are you doing today?'),
          e('div',{style:{display:'flex',flexWrap:'wrap',gap:'8px'}},
            statuses.map((s,i) => {
              const active = i === 0;
              return e('button',{
                key:s,
                style:{padding:'6px 12px',borderRadius:'20px',border:'1px solid #444',backgroundColor: active ? '#2563eb' : '#333',color:'#fff',fontSize:'14px',cursor:'pointer'}
              },s);
            })
          )
        ])
      ]),
      // Section cards
      e('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}},
        SECTIONS.map(sec => e(Card,{key:sec.id,section:sec,onClick:() => setRoute({type:'section',id:sec.id})}))
      ),
      e('p',{style:{marginTop:'24px',color:'#666',fontSize:'12px'}},'Tip: Add a video per section on the Video tab. Links save locally.'),
      e('p',{style:{marginTop:'8px',color:'#555',fontSize:'10px',textAlign:'center'}},'Minimal UI • Large tap targets • Read‑aloud • Progress auto‑save • Videos per section')
    ]);
  }

  // Detail view for a section
  function SectionDetail({ sectionId, videoMap,setVideoUrl,resetVideoUrl,playlist,goBack }) {
    const sec = SECTIONS.find(s => s.id === sectionId);
    const [mode,setMode] = useState('steps');
    return e('div',null,[
      e('button',{onClick:goBack,style:{padding:'6px 12px',borderRadius:'6px',border:'1px solid #444',backgroundColor:'#333',color:'#fff',cursor:'pointer',marginBottom:'16px',fontSize:'14px'}},'\u2039 Back'),
      e('h2',{style:{fontSize:'24px',fontWeight:'600',marginBottom:'16px'}},sec.title),
      e('div',{style:{display:'flex',gap:'8px',marginBottom:'12px'}},[
        e('button',{style:{padding:'6px 12px',borderRadius:'6px',border:'1px solid #444',backgroundColor: mode==='steps' ? '#2563eb' : '#333',color:'#fff',fontSize:'14px',cursor:'pointer'},onClick:() => setMode('steps')},'Steps'),
        e('button',{style:{padding:'6px 12px',borderRadius:'6px',border:'1px solid #444',backgroundColor: mode==='video' ? '#2563eb' : '#333',color:'#fff',fontSize:'14px',cursor:'pointer'},onClick:() => setMode('video')},'Video')
      ]),
      mode === 'steps'
        ? e('ul',{style:{listStyleType:'disc',paddingLeft:'24px',marginBottom:'16px',color:'#ccc',fontSize:'16px',lineHeight:'1.5'}},
            sec.steps.map((st,i) => e('li',{key:i,style:{marginBottom:'6px'}},st))
          )
        : e('div',null,[
            e(VideoPanel,{url: videoMap[sec.id]}),
            e(VideoEditor,{sectionId:sec.id,current: videoMap[sec.id],onSave:url => setVideoUrl(sec.id,url),onReset:() => resetVideoUrl(sec.id),recommendations: playlist[sec.id]})
          ])
    ]);
  }

  // Main app router
  function App() {
    const [vehicle,setVehicle] = useLocalStorage('teslaHelper.vehicle','3');
    const [videoMap,setVideoUrl,resetVideoUrl] = useVideoMap(vehicle);
    const playlists = useMemo(() => defaultPlaylist(vehicle),[vehicle]);
    const [route,setRoute] = useState({type:'home'});
    return e('div',{style:{maxWidth:'900px',margin:'0 auto',padding:'24px',color:'#fff',backgroundColor:'#000',minHeight:'100vh',fontFamily:'Arial, sans-serif'}},
      route.type==='home'
        ? e(Home,{vehicle,setVehicle,setRoute})
        : e(SectionDetail,{sectionId:route.id,videoMap,setVideoUrl,resetVideoUrl,playlist:playlists,goBack:() => setRoute({type:'home'})})
    );
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(e(App));
})();
