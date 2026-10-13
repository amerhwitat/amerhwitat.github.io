(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const actions = ['up','down','left','right','a','b','x','y','start','select','coin','pause'];
  const defaults = {up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',a:'KeyZ',b:'KeyX',x:'KeyA',y:'KeyS',start:'Enter',select:'ShiftLeft',coin:'Digit5',pause:'Escape'};
  let db=[], selected=null, core=null, romFiles=[], paused=false, soundEnabled=true;
  const safe = s => String(s ?? '').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const log = message => { const el=$('log'); if(!el)return; el.textContent += '['+new Date().toLocaleTimeString()+'] '+message+'\n'; el.scrollTop=el.scrollHeight; };
  const status = message => { $('status').textContent=message; log(message); };
  const mappings = id => { try { return {...defaults,...JSON.parse(localStorage.getItem('mame-controls:'+id)||'{}')}; } catch { return {...defaults}; } };
  function renderMap(){
    const map=mappings(selected?.id||'default');
    $('map').innerHTML=actions.map(a=>'<label>'+a+' <input data-a="'+a+'" value="'+safe(map[a]||'')+'" aria-label="Key for '+a+'"></label>').join('');
    $('map').querySelectorAll('input').forEach(input=>input.addEventListener('keydown',event=>{
      event.preventDefault(); const key=event.code||event.key; input.value=key;
      const id=selected?.id||'default', next=mappings(id); next[input.dataset.a]=key;
      localStorage.setItem('mame-controls:'+id,JSON.stringify(next)); log('Mapped '+input.dataset.a+' to '+key);
    }));
  }
  function render(){
    const query=$('search').value.toLowerCase(), system=$('system').value;
    const rows=db.filter(g=>(!query||(g.title+' '+g.system+' '+(g.manufacturer||'')).toLowerCase().includes(query))&&(!system||g.system.includes(system)));
    $('db').innerHTML=rows.slice(0,120).map(g=>'<article class="game"><h3>'+safe(g.title)+'</h3><div class="muted">'+safe(g.system)+' · '+safe(g.year||'')+'</div><button type="button" class="btn select" data-id="'+safe(g.id)+'">Select game</button></article>').join('')||'<p class="muted">No database entries match.</p>';
    $('db').querySelectorAll('[data-id]').forEach(button=>button.addEventListener('click',()=>{
      selected=db.find(g=>g.id===button.dataset.id)||null; renderMap();
      status(selected?'Selected '+selected.title+' ('+selected.id+'). Choose a compatible ROM and core to launch.':'No game selected.');
    }));
  }
  async function loadDB(){
    try { const response=await fetch('mame-game-db.json'); if(!response.ok)throw Error('HTTP '+response.status); const data=await response.json(); if(!Array.isArray(data))throw Error('Database must be a JSON array'); db=data; render(); log('Loaded '+db.length+' catalog records. Catalog entries are metadata, not bundled game ROMs.'); }
    catch(error){ $('db').innerHTML='<p class="muted">Game catalogue unavailable. Check mame-game-db.json.</p>'; log('Catalogue error: '+error.message); }
  }
  async function loadCore(){
    const url=$('coreUrl').value.trim();
    if(!url){ status('No core URL provided. Choose a trusted, compatible browser MAME/WebAssembly core. No emulator binary is bundled with this page.'); return; }
    let parsed; try { parsed=new URL(url,location.href); } catch { status('Invalid core URL.'); return; }
    if(!['https:','http:'].includes(parsed.protocol)){status('Core URL must use HTTP or HTTPS.');return;}
    try {
      status('Loading core script…');
      await new Promise((resolve,reject)=>{
        const script=document.createElement('script'); script.src=parsed.href; script.async=true;
        script.onload=resolve; script.onerror=()=>reject(Error('Could not load the core script (network, CORS, or URL error).'));
        document.head.appendChild(script);
      });
      const candidate=window.MAMECoreAdapter || window.MAMECore || window.mameCore;
      if(candidate && typeof candidate.launch==='function') core=candidate;
      else if(typeof window.embedMAME==='function') core={
        launch:async ({rom, name})=>window.embedMAME({container:'screen',name,rom,soundEnabled,showMobileControls:matchMedia('(pointer:coarse)').matches,cbStarted:()=>log('Core reported that emulation started.')}),
        pause:()=>window.pauseMAME?.(), reset:()=>window.resetMAME?.(),
        toggleSound:()=>window.toggleSoundMAME?.(),
        saveState:()=>window.downloadStateMAME?.(), loadState:()=>window.uploadStateMAME?.(),
        input:(action,down=true)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code:defaults[action]||action,bubbles:true}))
      };
      else throw Error('Script loaded but did not expose MAMECoreAdapter.launch() or embedMAME(). A generic Emscripten Module is not enough to infer a working emulator API.');
      status('Core adapter loaded. Select a game and its compatible ROM archive.');
    } catch(error){core=null; status('Core load failed: '+error.message);}
  }
  async function launch(){
    if(!selected){status('Select a game from the catalogue first.');return;}
    if(!core||typeof core.launch!=='function'){status('No usable emulator core. Load a compatible core first.');return;}
    if(!romFiles.length){$('roms').click();status('Choose a ROM archive you are authorized to use.');return;}
    const rom=romFiles[0];
    try {
      status('Preparing '+selected.title+'…');
      const result=await core.launch({driver:selected.id,game:selected,files:romFiles,rom,name:rom.name,container:$('screen'),soundEnabled});
      if(result===false)throw Error('The core rejected the game/ROM combination.');
      status('Launch sent to the emulator core for '+selected.title+'. Check the core output and diagnostics.');
    } catch(error){status('Launch failed: '+error.message);}
  }
  async function coreAction(name,...args){
    if(!core){status('This action needs a loaded emulator core.');return;}
    const fn=core[name];
    if(typeof fn!=='function'){status('The loaded core does not implement '+name+'; no false success reported.');return;}
    try { const result=await fn.apply(core,args); if(result===false)throw Error('Core reported failure'); log(name+' completed.'); }
    catch(error){status(name+' failed: '+error.message);}
  }
  $('search').addEventListener('input',render); $('system').addEventListener('change',render);
  $('roms').addEventListener('change',event=>{romFiles=[...event.target.files];status(romFiles.length?'Selected '+romFiles.length+' local ROM file(s): '+romFiles.map(f=>f.name).join(', '):'No ROM selected.');});
  $('scan').addEventListener('click',()=>{status('Browser security prevents silently scanning your disk. Use the ROM file picker to select local archives; files are not uploaded by this page.');$('roms').click();});
  $('loadCore').addEventListener('click',loadCore); $('launch').addEventListener('click',launch);
  $('pause').addEventListener('click',async()=>{if(!core){status('Load an emulator core first.');return;}const method=paused?'resume':'pause';if(typeof core[method]!=='function'){status('Loaded core does not expose '+method+'().');return;}const ok=await coreAction(method);if(ok!==false){paused=!paused;$('pause').textContent=paused?'Resume':'Pause';}});
  $('reset').addEventListener('click',()=>coreAction('reset'));
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('screen').requestFullscreen();}catch(e){status('Fullscreen unavailable: '+e.message);}});
  $('save').addEventListener('click',async()=>{if(!selected){status('Select a game before saving.');return;}if(!core||typeof core.saveState!=='function'){status('This core does not expose saveState(); no save was created.');return;}try{const state=await core.saveState();if(state==null||state===false)throw Error('Core returned no save data.');if(state instanceof Blob){const url=URL.createObjectURL(state),a=document.createElement('a');a.href=url;a.download=selected.id+'.state';a.click();URL.revokeObjectURL(url);}else if(state instanceof ArrayBuffer||ArrayBuffer.isView(state)){const blob=new Blob([state]);const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=selected.id+'.state';a.click();URL.revokeObjectURL(url);}else localStorage.setItem('mame-state:'+selected.id,typeof state==='string'?state:JSON.stringify(state));log('Save state exported/stored for '+selected.id+'.');}catch(e){status('Save failed: '+e.message);}});
  $('load').addEventListener('click',async()=>{if(!selected){status('Select a game before loading a state.');return;}if(!core||typeof core.loadState!=='function'){status('This core does not expose loadState().');return;}const saved=localStorage.getItem('mame-state:'+selected.id);if(saved===null){status('No browser-stored save exists. If the core supports file import, use its own load-state interface.');return;}try{await core.loadState(saved);log('Load state sent to core.');}catch(e){status('Load failed: '+e.message);}});
  $('sound').addEventListener('click',async()=>{soundEnabled=!soundEnabled;$('sound').textContent=soundEnabled?'Sound: On':'Sound: Off';if(core&&typeof core.toggleSound==='function')await coreAction('toggleSound',soundEnabled);else log('UI sound preference set to '+(soundEnabled?'on':'off')+'; emulator sound API is not available.');});
  $('coin').addEventListener('click',()=>coreAction('input','coin',true));
  $('p1').addEventListener('click',()=>coreAction('input','start',true));
  window.addEventListener('keydown',event=>{if(!selected||event.target.matches('input,textarea,select'))return;const map=mappings(selected.id),action=actions.find(a=>map[a]===event.code);if(action&&core?.input){event.preventDefault();core.input(action,true);}});
  window.addEventListener('keyup',event=>{if(!selected)return;const map=mappings(selected.id),action=actions.find(a=>map[a]===event.code);if(action&&core?.input)core.input(action,false);});
  window.addEventListener('gamepadconnected',event=>log('Gamepad connected: '+event.gamepad.id+'. Core must implement gamepad/input support to consume it.'));
  renderMap(); loadDB();
})();