(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const loader = $('desktopLoader');
  const progressBar = $('desktopProgress');
  const progressText = $('desktopProgressText');
  const loaderStarted = performance.now();
  function setProgress(value, message) {
    const n = Math.max(0, Math.min(100, value));
    if (progressBar) progressBar.style.width = n + '%';
    if (progressText) progressText.textContent = message + ' ' + n + '%';
  }
  function finishLoading() {
    setProgress(100, 'Aurora ready');
    const delay = Math.max(0, 550 - (performance.now() - loaderStarted));
    setTimeout(() => loader?.classList.add('hidden'), delay);
  }
  setProgress(18, 'Loading desktop shell…');

  const state = {
    profile: localStorage.getItem('chimera.desktop.profile') || 'aurora-native',
    profiles: []
  };

  const routeMap = {
    hub:'aurora-interaction-hub.html', files:'artifact-library.html', terminal:'aurora_terminal.html',
    browser:'index.html', code:'chimera_code_ide.html', settings:'system_control_center.html',
    help:'command-console.html', ss64:'command-console.html', emulators:'retro_emulators.html',
    emulator:'aurora-emulator.html', games:'game-center.html', network:'network-engine.html',
    research:'research-lab.html', mame:'mame-center.html', playstation:'playstation_emulators.html',
    iso:'iso-flash-center.html', ocr:'ocr-studio.html', isa:'isa-explorer.html', pdf:'pdf-reader.html',
    health:'health.html', crash:'crash_center.html', desktop:'desktop_switcher.html',
    repo:'repository-app-studio.html', language:'chimera-language-runtime.html',
    hercules:'hercules-integration.html'
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function showWindow(title, html) {
    const w = $('window'), c = $('windowContent');
    if (!w || !c) return;
    $('windowTitle').textContent = title;
    c.innerHTML = html;
    w.classList.remove('hidden');
    requestAnimationFrame(() => c.querySelector('a,button,input')?.focus({preventScroll:true}));
  }

  function openRoute(title, path) {
    if (!path) return;
    showWindow(title, '<iframe class="app-frame" loading="eager" title="' + esc(title) +
      '" src="' + esc(path) + '"></iframe>');
  }

  function showDesktopProfiles() {
    const cards = state.profiles.map(p =>
      '<button class="profile-card" data-profile="' + esc(p.id) + '"><b>' +
      esc(p.title) + '</b><br><small>' + esc(p.family) + ' · ' + esc(p.mode) +
      '</small></button>').join('');
    showWindow('Desktop Profiles',
      '<p>Visual Web adapters for Linux and Windows families. A real host session/VM/RDP is used only when an authorized backend is configured.</p>' +
      '<div class="profile-list">' + (cards || '<p>No profile catalog available.</p>') + '</div>');
    document.querySelectorAll('[data-profile]').forEach(b => b.addEventListener('click', () => {
      state.profile = b.dataset.profile;
      localStorage.setItem('chimera.desktop.profile', state.profile);
      applyProfile();
      showDesktopProfiles();
    }));
  }

  function applyProfile() {
    const p = state.profiles.find(x => x.id === state.profile);
    const title = p ? p.title : state.profile;
    if ($('profileName')) $('profileName').textContent = title;
    if ($('railProfile')) $('railProfile').textContent = title;
    if ($('modeLabel')) $('modeLabel').textContent = p ? p.family + ' · ' + p.mode : 'Aurora Web desktop';
  }

  function app(name) {
    switch (name) {
      case 'launcher': $('launcher')?.classList.toggle('hidden'); break;
      case 'files': showWindow('Files','<h2>Home</h2><p>Desktop · Documents · Downloads · Music · Pictures · Videos</p><div class="profile-list"><div class="profile-card">▰ Desktop</div><div class="profile-card">▰ Documents</div><div class="profile-card">▰ Downloads</div><div class="profile-card">▰ Projects</div></div>'); break;
      case 'terminal': openRoute('Aurora Terminal',routeMap.terminal); break;
      case 'browser': openRoute('Aurora Web Workspace',routeMap.browser); break;
      case 'code': openRoute('Chimera Code IDE',routeMap.code); break;
      case 'settings': openRoute('System Control',routeMap.settings); break;
      case 'help': case 'ss64': openRoute('SS64 Command Center',routeMap.help); break;
      case 'desktop': showDesktopProfiles(); break;
      case 'hub': openRoute('Aurora Interaction Hub',routeMap.hub); break;
      case 'emulators': openRoute('Retro Emulators',routeMap.emulators); break;
      case 'emulator': openRoute('Aurora Emulator',routeMap.emulator); break;
      case 'games': openRoute('Game Center',routeMap.games); break;
      case 'network': openRoute('Network Engine',routeMap.network); break;
      case 'research': openRoute('Research Lab',routeMap.research); break;
      case 'mame': openRoute('MAME Center',routeMap.mame); break;
      case 'playstation': openRoute('PlayStation Hub',routeMap.playstation); break;
      case 'iso': openRoute('ISO & Flash Center',routeMap.iso); break;
      case 'ocr': openRoute('OCR Studio',routeMap.ocr); break;
      case 'isa': openRoute('ISA Explorer',routeMap.isa); break;
      case 'pdf': openRoute('PDF Reader',routeMap.pdf); break;
      case 'health': openRoute('Health',routeMap.health); break;
      case 'crash': openRoute('Crash Center',routeMap.crash); break;
      case 'repo-studio': openRoute('Repository App Studio',routeMap.repo); break;
      case 'language-runtime': openRoute('Chimera Language Runtime Lab',routeMap.language); break;
      case 'hercules': openRoute('Hercules Runtime',routeMap.hercules); break;
      case 'search': $('desktopSearch')?.focus(); break;
      case 'home': $('launcher')?.classList.add('hidden'); $('window')?.classList.add('hidden'); break;
    }
  }

  setProgress(48, 'Binding application controls…');
  document.querySelectorAll('[data-app]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      app(button.dataset.app);
    });
  });

  $('launcherButton')?.addEventListener('click', () => app('launcher'));
  async function loadAuroraApplicationRegistry() {
    const matrix = $('appMatrix');
    if (!matrix) return;
    const localFallback = [{"id":"local-ancient-ocr-html","title":"Ancient Language Auto OCR","icon":"APP","url":"ancient-ocr.html","mode":"embedded","category":"Local Web Apps","order":0},{"id":"local-artifact-library-html","title":"Aurora Artifact Library","icon":"APP","url":"artifact-library.html","mode":"embedded","category":"Local Web Apps","order":1},{"id":"local-aurora-ecosystem-center-html","title":"Aurora Ecosystem Center","icon":"APP","url":"aurora-ecosystem-center.html","mode":"embedded","category":"Local Web Apps","order":2},{"id":"local-aurora-emulator-html","title":"Aurora Emulator","icon":"APP","url":"aurora-emulator.html","mode":"embedded","category":"Local Web Apps","order":3},{"id":"local-aurora-interaction-hub-html","title":"Aurora Interaction Hub","icon":"APP","url":"aurora-interaction-hub.html","mode":"embedded","category":"Local Web Apps","order":4},{"id":"local-aurora-3d-desktop-html","title":"Aurora 3D Desktop","icon":"APP","url":"aurora_3d_desktop.html","mode":"embedded","category":"Local Web Apps","order":5},{"id":"local-aurora-terminal-html","title":"Aurora Terminal","icon":"APP","url":"aurora_terminal.html","mode":"embedded","category":"Local Web Apps","order":6},{"id":"local-backend-status-html","title":"Aurora Backend Gateway","icon":"APP","url":"backend-status.html","mode":"embedded","category":"Local Web Apps","order":7},{"id":"local-chimera-language-runtime-html","title":"Chimera Language Runtime Lab","icon":"APP","url":"chimera-language-runtime.html","mode":"embedded","category":"Local Web Apps","order":8},{"id":"local-chimera-code-ide-html","title":"Chimera Code IDE","icon":"APP","url":"chimera_code_ide.html","mode":"embedded","category":"Local Web Apps","order":9},{"id":"local-command-console-html","title":"Aurora Command Center","icon":"APP","url":"command-console.html","mode":"embedded","category":"Local Web Apps","order":10},{"id":"local-crash-center-html","title":"Crash Center & Recovery","icon":"APP","url":"crash_center.html","mode":"embedded","category":"Local Web Apps","order":11},{"id":"local-desktop-switcher-html","title":"Desktop Switcher","icon":"APP","url":"desktop_switcher.html","mode":"embedded","category":"Local Web Apps","order":12},{"id":"local-game-center-html","title":"Aurora Complete Game Center","icon":"APP","url":"game-center.html","mode":"embedded","category":"Local Web Apps","order":13},{"id":"local-health-html","title":"System Health & KPIs","icon":"APP","url":"health.html","mode":"embedded","category":"Local Web Apps","order":14},{"id":"local-hercules-integration-html","title":"Hercules Runtime","icon":"APP","url":"hercules-integration.html","mode":"embedded","category":"Local Web Apps","order":15},{"id":"local-index-html","title":"Chimera II Web Home","icon":"APP","url":"index.html","mode":"embedded","category":"Local Web Apps","order":16},{"id":"local-installer-manager-html","title":"Chimera Installer Manager","icon":"APP","url":"installer_manager.html","mode":"embedded","category":"Local Web Apps","order":17},{"id":"local-isa-explorer-html","title":"Chimera ISA Explorer","icon":"APP","url":"isa-explorer.html","mode":"embedded","category":"Local Web Apps","order":18},{"id":"local-iso-flash-center-html","title":"ISO & Flash Center","icon":"APP","url":"iso-flash-center.html","mode":"embedded","category":"Local Web Apps","order":19},{"id":"local-mame-center-html","title":"Aurora MAME Arcade Center","icon":"APP","url":"mame-center.html","mode":"embedded","category":"Local Web Apps","order":20},{"id":"local-network-engine-html","title":"Aurora Network Engine","icon":"APP","url":"network-engine.html","mode":"embedded","category":"Local Web Apps","order":21},{"id":"local-network-monitor-html","title":"TCP/IP Network Monitor","icon":"APP","url":"network_monitor.html","mode":"embedded","category":"Local Web Apps","order":22},{"id":"local-ocr-studio-html","title":"Aurora OCR Studio","icon":"APP","url":"ocr-studio.html","mode":"embedded","category":"Local Web Apps","order":23},{"id":"local-repository-app-studio-html","title":"Repository App Studio","icon":"APP","url":"repository-app-studio.html","mode":"embedded","category":"Local Web Apps","order":24},{"id":"local-research-lab-html","title":"Aurora Research Lab","icon":"APP","url":"research-lab.html","mode":"embedded","category":"Local Web Apps","order":25},{"id":"local-research-os-html","title":"Chimera Research OS","icon":"APP","url":"research-os.html","mode":"embedded","category":"Local Web Apps","order":26},{"id":"local-retro-emulators-html","title":"Retro Computer Emulators","icon":"APP","url":"retro_emulators.html","mode":"embedded","category":"Local Web Apps","order":27},{"id":"local-smart-model-html","title":"Aurora Smart Model","icon":"APP","url":"smart-model.html","mode":"embedded","category":"Local Web Apps","order":28},{"id":"local-system-control-center-html","title":"System Control Center","icon":"APP","url":"system_control_center.html","mode":"embedded","category":"Local Web Apps","order":29},{"id":"local-thamudicscan-html","title":"Aurora ThamudicScan","icon":"APP","url":"thamudicscan.html","mode":"embedded","category":"Local Web Apps","order":30},{"id":"local-wallet-center-html","title":"Aurora Wallet & Ecosystem Center","icon":"APP","url":"wallet-center.html","mode":"embedded","category":"Local Web Apps","order":31}];
    const escText = value => esc(value);
    const iconFor = appItem => appItem.icon || 'APP';
    const render = apps => {
      const seen = new Set();
      const usable = apps.filter(item => {
        if (!item || !item.title || !item.url || seen.has(item.url)) return false;
        seen.add(item.url);
        return true;
      });
      matrix.innerHTML = usable.map(item => {
        const external = /^https?:\/\//i.test(item.url);
        return '<button class="aurora-app-tile" data-registry-app="1" data-app-title="' + escText(item.title) +
          '" data-app-url="' + escText(item.url) + '" title="' + escText(item.title) + '">' +
          '<span class="tile-icon">' + escText(iconFor(item)) + '</span><small>' + escText(item.title) +
          (external ? ' ↗' : '') + '</small></button>';
      }).join('');
      matrix.querySelectorAll('[data-registry-app]').forEach(button => {
        button.addEventListener('click', () => {
          const title=button.dataset.appTitle, path=button.dataset.appUrl;
          if (/^https?:\/\//i.test(path)) {
            sayRegistryStatus('Opening '+title);
            window.open(path,'_blank','noopener,noreferrer');
          } else {
            openRoute(title,path);
          }
        });
      });
      sayRegistryStatus('Aurora launcher · '+usable.length+' applications indexed');
    };
    const sayRegistryStatus = message => {
      if ($('statusMessage')) $('statusMessage').textContent=message;
    };
    try {
      const [catalogResponse,indexResponse] = await Promise.all([
        fetch('aurora_apps.json',{cache:'no-store'}),
        fetch('aurora-app-index.json',{cache:'no-store'})
      ]);
      const catalog = catalogResponse.ok ? await catalogResponse.json() : {};
      const indexData = indexResponse.ok ? await indexResponse.json() : {apps:localFallback};
      const catalogApps = (catalog.categories || []).flatMap(category =>
        (category.apps || []).map(item => ({...item, category:category.title}))
      ).filter(item => item.url && item.url !== 'aurora_3d_desktop.html');
      const merged = [...catalogApps, ...(indexData.apps || localFallback)];
      render(merged);
    } catch (error) {
      console.warn('Aurora application registry fallback:',error);
      render(localFallback);
    }
  }

  setProgress(72, 'Connecting Aurora application routes…');
  $('dockLauncher')?.addEventListener('click', () => app('launcher'));

  document.querySelectorAll('[data-window]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.window, w = $('window');
    if (!w) return;
    if (action === 'close' || action === 'min') w.classList.add('hidden');
    if (action === 'max') w.classList.toggle('maximized');
  }));

  $('desktopSearch')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.value.trim())
      showWindow('Desktop Search','<h2>Search</h2><p>Searching Aurora applications for <b>' +
        esc(e.target.value.trim()) + '</b>.</p><div class="profile-list"><button class="profile-card" data-app="hub">Open All Aurora Apps</button><button class="profile-card" data-app="emulator">Open Aurora Emulator</button></div>');
  });

  $('windowContent')?.addEventListener('click', e => {
    const b = e.target.closest('[data-app]');
    if (b) app(b.dataset.app);
  });

  fetch('desktop_profiles.json',{cache:'no-store'})
    .then(r => r.ok ? r.json() : Promise.reject(new Error('profile catalog unavailable')))
    .then(c => { state.profiles = c.profiles || []; applyProfile(); })
    .catch(() => applyProfile());

  function clock() {
    const d = new Date();
    if ($('clock')) $('clock').textContent = d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    if ($('timeLarge')) $('timeLarge').textContent = d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    if ($('dateText')) $('dateText').textContent = d.toLocaleDateString([], {weekday:'long',month:'long',day:'numeric',year:'numeric'});
  }
  setInterval(clock,1000); clock();

  // Three.js is an enhancement only. The desktop remains fully clickable if CDN/WebGL is unavailable.
  function initScene() {
    if (!window.THREE) {
      $('modeLabel') && ($('modeLabel').textContent = 'Aurora Web desktop · 2D fallback');
      return;
    }
    try {
      const canvas = $('aurora3dCanvas');
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x071426,0.018);
      const camera = new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.1,500);
      camera.position.set(0,5,22);
      const renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
      renderer.setPixelRatio(Math.min(devicePixelRatio,2));
      renderer.setSize(innerWidth,innerHeight);
      const world = new THREE.Group(); scene.add(world);
      world.add(new THREE.HemisphereLight(0xb9ddff,0x07101d,2.1));
      const sun = new THREE.DirectionalLight(0x9acfff,2.5); sun.position.set(8,12,6); world.add(sun);
      const lake = new THREE.Mesh(new THREE.PlaneGeometry(180,90),new THREE.MeshStandardMaterial({color:0x0a2038,roughness:.2,metalness:.25,transparent:true,opacity:.82}));
      lake.rotation.x=-Math.PI/2; lake.position.y=-3; world.add(lake);
      const mountains = new THREE.Group();
      for(let i=0;i<16;i++){const h=3+Math.random()*8,w=5+Math.random()*8,m=new THREE.Mesh(new THREE.ConeGeometry(w,h,5),new THREE.MeshStandardMaterial({color:0x183a58,roughness:1}));m.position.set((i-8)*7+Math.random()*3,h/2-3,-8-Math.random()*10);m.rotation.y=Math.random()*Math.PI;mountains.add(m);}
      world.add(mountains);
      const aurora = new THREE.Group();
      for(let i=0;i<9;i++){const g=new THREE.TorusGeometry(5+i*.65,.025+i*.008,8,160,Math.PI*1.35),m=new THREE.MeshBasicMaterial({color:i%2?0x8d7cff:0x67dfff,transparent:true,opacity:.16}),r=new THREE.Mesh(g,m);r.position.y=3+i*.35;r.rotation.x=Math.PI/2.5;r.rotation.z=i*.08;aurora.add(r);}
      world.add(aurora);
      const stars = new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:0xdaf3ff,size:.07,transparent:true,opacity:.7}));
      const pos=[]; for(let i=0;i<1200;i++)pos.push((Math.random()-.5)*180,Math.random()*55-5,-Math.random()*100);
      stars.geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); world.add(stars);
      function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}
      addEventListener('resize',resize);
      addEventListener('pointermove',e=>{world.rotation.y=((e.clientX/innerWidth)-.5)*.02;world.rotation.x=((e.clientY/innerHeight)-.5)*-.025;});
      function animate(t){requestAnimationFrame(animate);aurora.rotation.y=t*.00005;stars.rotation.y=t*.000003;renderer.render(scene,camera);}
      animate(0);
    } catch (err) {
      console.warn('Aurora 3D renderer unavailable; keeping HTML desktop active.',err);
      $('modeLabel') && ($('modeLabel').textContent='Aurora Web desktop · 2D fallback');
    }
  }
  loadAuroraApplicationRegistry();

  // The desktop is intentionally independent of Three.js/CDN availability.
  // The checked-in SVG/CSS environment is the primary renderer.
  setProgress(88, 'Finalizing visual environment…');
  initScene();
  finishLoading();

  // Interaction sounds and window dragging are optional enhancements.
  (() => {
    const soundKey='chimera.aurora.sounds';
    let soundOn=localStorage.getItem(soundKey)!=='off', audioCtx=null;
    function ensureAudio(){if(!soundOn)return null;if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}
    function tone(freq,dur,type='sine',gain=.018){const a=ensureAudio();if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+dur);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+dur);}
    function updateSoundUI(){const b=$('soundToggle');if(b){b.textContent=soundOn?'🔊':'🔇';b.setAttribute('aria-pressed',String(soundOn));}}
    $('soundToggle')?.addEventListener('click',()=>{soundOn=!soundOn;localStorage.setItem(soundKey,soundOn?'on':'off');if(soundOn)tone(740,.08);updateSoundUI();});
    document.addEventListener('click',e=>{if(e.target.closest('button,a'))tone(620,.04,'triangle');});
    updateSoundUI();
  })();
  // Aurora simulator enhancement layer: keyboard controls, live telemetry, visual profiles,
  // and a non-destructive 3D performance switch. These controls degrade cleanly to 2D.
  (() => {
    const panel = $('auroraControlPanel');
    const status = $('statusMessage');
    const dot = document.querySelector('.status-dot');
    const canvas = $('aurora3dCanvas');
    const telemetry = { frames: 0, last: performance.now(), fps: 0, enabled: true };
    const settings = {
      intensity: Number(localStorage.getItem('chimera.aurora.intensity') || 72),
      motion: Number(localStorage.getItem('chimera.aurora.motion') || 55),
      blur: Number(localStorage.getItem('chimera.aurora.blur') || 18)
    };
    function say(message, kind='ready'){
      if(status) status.textContent=message;
      if(dot) dot.className='status-dot'+(kind==='busy'?' busy':kind==='warn'?' warn':'');
    }
    function setVar(name,value){document.documentElement.style.setProperty(name,value+'px');}
    const intensity=$('sceneIntensity'), motion=$('sceneMotion'), blur=$('glassBlur');
    if(intensity) intensity.value=settings.intensity;
    if(motion) motion.value=settings.motion;
    if(blur) blur.value=settings.blur;
    intensity?.addEventListener('input',e=>{
      settings.intensity=+e.target.value; localStorage.setItem('chimera.aurora.intensity',settings.intensity);
      if(canvas) canvas.style.opacity=(0.04+settings.intensity/100*0.3).toFixed(2);
      say('Aurora scene intensity '+settings.intensity+'%','busy');
    });
    motion?.addEventListener('input',e=>{
      settings.motion=+e.target.value; localStorage.setItem('chimera.aurora.motion',settings.motion);
      say('Aurora motion '+settings.motion+'%','busy');
    });
    blur?.addEventListener('input',e=>{
      settings.blur=+e.target.value; localStorage.setItem('chimera.aurora.blur',settings.blur);
      setVar('--aurora-user-blur',settings.blur); say('Glass blur '+settings.blur+'px');
    });
    $('closeAuroraControls')?.addEventListener('click',()=>panel?.classList.add('hidden'));
    $('toggleTelemetry')?.addEventListener('click',()=>say('Telemetry: '+(telemetry.enabled?'LIVE':'PAUSED')));
    $('toggle3D')?.addEventListener('click',e=>{
      telemetry.enabled=!telemetry.enabled;
      if(canvas) canvas.style.visibility=telemetry.enabled?'visible':'hidden';
      e.currentTarget.textContent='3D: '+(telemetry.enabled?'ON':'OFF');
      $('renderState') && ($('renderState').textContent=telemetry.enabled?'3D':'2D');
      say('Aurora renderer '+(telemetry.enabled?'enabled':'paused'));
    });
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();app('launcher');}
      if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='a'){e.preventDefault();panel?.classList.toggle('hidden');}
      if(e.key==='Escape'){panel?.classList.add('hidden');$('launcher')?.classList.add('hidden');}
    });
    setInterval(()=>{
      if(!telemetry.enabled)return;
      const now=performance.now(), elapsed=now-telemetry.last;
      telemetry.fps=Math.round((telemetry.frames*1000)/Math.max(1,elapsed));
      telemetry.frames=0; telemetry.last=now;
      if($('fpsState')) $('fpsState').textContent=telemetry.fps+' FPS';
      if($('gpuState')) $('gpuState').textContent=window.THREE?'WEBGL':'2D';
    },1000);
    const oldOpenRoute=openRoute;
    openRoute=(title,path)=>{say('Opening '+title,'busy');oldOpenRoute(title,path);setTimeout(()=>say(title+' ready'),500);};
    document.querySelectorAll('[data-app]').forEach(b=>b.addEventListener('click',()=>say('Launching '+(b.dataset.app||'application'),'busy'),{once:false}));
    setVar('--aurora-user-blur',settings.blur);
    if(canvas) canvas.style.opacity=(0.04+settings.intensity/100*0.3).toFixed(2);
    say('Aurora Wayland Glass · Enhanced simulator mode');
    window.setInterval(()=>{if(telemetry.enabled)telemetry.frames++;},16);
  })();
})();