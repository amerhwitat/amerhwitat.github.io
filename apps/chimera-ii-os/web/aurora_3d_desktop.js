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
  if (state.profile === 'marine-desktop' && !location.pathname.endsWith('/marine_desktop.html')) {
    location.replace('marine_desktop.html');
  }

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
      if (state.profile === 'marine-desktop') { location.href = 'marine_desktop.html'; return; }
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
    const allowedBackgrounds = new Set(['chimera-hero-3840x2160.svg','octavian-celestial-octopus-3840x2160.svg','marine-desktop.svg']);
    const desktop = document.querySelector('.aurora3d');
    if (desktop && p && allowedBackgrounds.has(p.background)) {
      desktop.style.backgroundImage = 'linear-gradient(180deg,rgba(3,9,20,.42),rgba(2,7,15,.3)),url("' + p.background + '")';
      desktop.style.backgroundPosition = 'center'; desktop.style.backgroundSize = 'cover';
    }
    if (desktop && p && p.id === 'aurora-native') {
      const saved = localStorage.getItem('chimera.desktop.background');
      if (allowedBackgrounds.has(saved)) desktop.style.backgroundImage = 'linear-gradient(180deg,rgba(3,9,20,.42),rgba(2,7,15,.3)),url("' + saved + '")';
    }
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
    const canvas = $('aurora3dCanvas');
    if (!canvas) return;
    const attributes = { alpha:true, antialias:true, depth:false, stencil:false, powerPreference:'high-performance' };
    const gl = canvas.getContext('webgl2', attributes) || canvas.getContext('webgl', attributes) || canvas.getContext('experimental-webgl', attributes);
    if (!gl) {
      window.AuroraWebGLActive = false;
      $('modeLabel') && ($('modeLabel').textContent = 'Aurora Web desktop · CSS fallback (WebGL unavailable)');
      canvas.style.display = 'none';
      return;
    }
    const webgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
    const vertex1 = 'attribute vec2 aPosition; varying vec2 vUv; void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}';
    const fragment1 = 'precision highp float; varying vec2 vUv; uniform float uTime; uniform vec2 uResolution; uniform vec2 uPointer; void main(){vec2 uv=vUv;vec2 p=(uv-.5)*vec2(uResolution.x/max(uResolution.y,1.),1.);p.x+=uPointer.x*.025;p.y+=uPointer.y*.02;float t=uTime*.12;float ridge=.30+.07*sin(p.x*1.8+t*.55)+.035*sin(p.x*5.2-t);float band=exp(-pow((p.y-ridge),2.)*28.);float veil=sin(p.x*3.1+t+sin(p.y*5.0)*.8)*.5+.5;float aurora=band*(.35+.65*veil);float horizon=exp(-abs(p.y+.23)*3.2);float stars=step(.997,fract(sin(dot(floor(uv*uResolution*.08),vec2(12.9898,78.233)))*43758.5453));vec3 base=mix(vec3(.006,.015,.04),vec3(.025,.105,.17),uv.y);vec3 color=base+vec3(.12,.76,.98)*aurora*.72+vec3(.30,.24,.82)*aurora*.22+vec3(.06,.22,.34)*horizon*.25;color+=vec3(.65,.84,1.)*stars*.75;float vignette=1.-smoothstep(.18,1.12,length((uv-.5)*vec2(1.,.82)));gl_FragColor=vec4(color*vignette,.88);}';
    const vertex2 = '#version 300 es\nin vec2 aPosition; out vec2 vUv; void main(){vUv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}';
    const fragment2 = '#version 300 es\nprecision highp float; in vec2 vUv; uniform float uTime; uniform vec2 uResolution; uniform vec2 uPointer; out vec4 outColor; void main(){vec2 uv=vUv;vec2 p=(uv-.5)*vec2(uResolution.x/max(uResolution.y,1.),1.);p.x+=uPointer.x*.025;p.y+=uPointer.y*.02;float t=uTime*.12;float ridge=.30+.07*sin(p.x*1.8+t*.55)+.035*sin(p.x*5.2-t);float band=exp(-pow((p.y-ridge),2.)*28.);float veil=sin(p.x*3.1+t+sin(p.y*5.0)*.8)*.5+.5;float aurora=band*(.35+.65*veil);float horizon=exp(-abs(p.y+.23)*3.2);float stars=step(.997,fract(sin(dot(floor(uv*uResolution*.08),vec2(12.9898,78.233)))*43758.5453));vec3 base=mix(vec3(.006,.015,.04),vec3(.025,.105,.17),uv.y);vec3 color=base+vec3(.12,.76,.98)*aurora*.72+vec3(.30,.24,.82)*aurora*.22+vec3(.06,.22,.34)*horizon*.25;color+=vec3(.65,.84,1.)*stars*.75;float vignette=1.-smoothstep(.18,1.12,length((uv-.5)*vec2(1.,.82)));outColor=vec4(color*vignette,.88);}';
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) || 'Aurora shader compile failed';
        gl.deleteShader(shader);
        throw new Error(message);
      }
      return shader;
    }
    try {
      const vs = compile(gl.VERTEX_SHADER, webgl2 ? vertex2 : vertex1);
      const fs = compile(gl.FRAGMENT_SHADER, webgl2 ? fragment2 : fragment1);
      const program = gl.createProgram();
      gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
      gl.deleteShader(vs); gl.deleteShader(fs);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Aurora shader link failed');
      const position = gl.getAttribLocation(program, 'aPosition');
      const time = gl.getUniformLocation(program, 'uTime');
      const resolution = gl.getUniformLocation(program, 'uResolution');
      const pointer = gl.getUniformLocation(program, 'uPointer');
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
      let px=0, py=0, frame=0, running=true;
      function resize() {
        const ratio=Math.min(devicePixelRatio||1,2);
        const width=Math.max(1,Math.floor(innerWidth*ratio));
        const height=Math.max(1,Math.floor(innerHeight*ratio));
        if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
        gl.viewport(0,0,width,height);
      }
      addEventListener('resize',resize);
      addEventListener('pointermove',event=>{px=event.clientX/Math.max(1,innerWidth)-.5;py=event.clientY/Math.max(1,innerHeight)-.5;},{passive:true});
      canvas.addEventListener('webglcontextlost',event=>{
        event.preventDefault(); running=false; window.AuroraWebGLActive=false;
        $('modeLabel') && ($('modeLabel').textContent='Aurora Web desktop · WebGL context lost');
      });
      function draw(now) {
        if(!running)return;
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
        gl.uniform1f(time,now/1000);
        gl.uniform2f(resolution,canvas.width,canvas.height);
        gl.uniform2f(pointer,px,py);
        gl.drawArrays(gl.TRIANGLES,0,3);
        frame=requestAnimationFrame(draw);
      }
      resize();
      window.AuroraWebGLActive=true;
      window.AuroraWebGLVersion=webgl2?'WebGL 2':'WebGL 1 fallback';
      $('modeLabel') && ($('modeLabel').textContent='Aurora Web desktop · '+window.AuroraWebGLVersion);
      canvas.style.display='block';
      frame=requestAnimationFrame(draw);
    } catch (error) {
      window.AuroraWebGLActive=false;
      console.warn('Aurora WebGL initialization failed; retaining the interactive desktop UI.',error);
      $('modeLabel') && ($('modeLabel').textContent='Aurora Web desktop · CSS fallback');
      canvas.style.display='none';
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
    // Shared site-interactions.js owns global click/double-click sounds to avoid duplicate tones.
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
      if($('gpuState')) $('gpuState').textContent=window.AuroraWebGLActive?'WEBGL':'CSS';
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