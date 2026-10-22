/* Accessible launchpad enhancements; no external runtime dependencies. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const count = $('#metric-apps');
  try { if (count && typeof APPS !== 'undefined') count.textContent = APPS.length.toLocaleString(); } catch (_) {}
  const body = document.body;
  const theme = document.createElement('button');
  theme.id = 'studio-theme-toggle'; theme.type = 'button'; theme.setAttribute('aria-pressed','false');
  const themeKey = 'amerhwitat.landing.theme';
  let light = false;
  try { light = localStorage.getItem(themeKey) === 'light'; } catch (_) {}
  const paintTheme = () => { body.classList.toggle('studio-light', light); theme.textContent = light ? '☾ Dark mode' : '☼ Light mode'; theme.setAttribute('aria-pressed',String(light)); theme.setAttribute('aria-label',light?'Switch to dark appearance':'Switch to light appearance'); };
  theme.addEventListener('click', () => { light = !light; try { localStorage.setItem(themeKey,light?'light':'dark'); } catch (_) {} paintTheme(); });
  document.body.appendChild(theme); paintTheme();

  const links = [
    ['Explore application catalogue','#apps','Browse and filter the portfolio'],
    ['Aurora Wayland Glass Desktop','apps/aurora-glass-desktop/index.html','Launch the interactive desktop preview'],
    ['Aurora 3D Desktop','apps/chimera-ii-os/web/aurora_3d_desktop.html','Immersive desktop experiment'],
    ['ThamudicScan','apps/thamudic-scanner/index.html','Ancient-language research workspace'],
    ['Optional Application Center','apps/optional-app-center/index.html','Cross-platform application catalogue'],
    ['Repository Hub','repository-hub.html','Explore source repositories'],
    ['Build & Release Status','project-updates.html','Review project-reported acceptance status'],
    ['Flash Center','apps/chimera-ii-os/web/iso-flash-center.html','ISO verification and flash workflow']
  ];
  const backdrop = document.createElement('div'); backdrop.className = 'studio-command-backdrop'; backdrop.id = 'studio-command-backdrop';
  backdrop.innerHTML = '<div class="studio-command" role="dialog" aria-modal="true" aria-labelledby="studio-command-title"><div class="studio-command-head"><label id="studio-command-title" for="studio-command-input">QUICK LAUNCH · Search destinations</label><input id="studio-command-input" type="search" placeholder="Type an app, workspace or action…" autocomplete="off"></div><div class="studio-command-list" id="studio-command-list"></div><div class="studio-command-foot"><span>↑ ↓ browse · Enter open · Esc close</span><span>Ctrl / ⌘ K</span></div></div>';
  document.body.appendChild(backdrop);
  const input = $('#studio-command-input',backdrop), list = $('#studio-command-list',backdrop);
  let selected = 0;
  function drawCommands() {
    const term = input.value.trim().toLowerCase();
    const matches = links.filter(x => x.join(' ').toLowerCase().includes(term));
    selected = Math.min(selected,Math.max(0,matches.length-1));
    list.innerHTML = matches.length ? matches.map((x,i) => '<a href="'+x[1].replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'" data-command-index="'+i+'" '+(i===selected?'aria-current="true"':'')+'><span>'+x[0]+'<br><small>'+x[2]+'</small></span><small>↗</small></a>').join('') : '<p style="padding:16px;color:#9fb6d1;font-size:13px">No destinations found. Try “desktop”, “research” or “release”.</p>';
  }
  function openCommands() { backdrop.classList.add('open'); input.value=''; selected=0; drawCommands(); input.focus(); }
  function closeCommands() { backdrop.classList.remove('open'); }
  $('#open-command')?.addEventListener('click',openCommands);
  document.addEventListener('keydown',e => {
    if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k') { e.preventDefault(); openCommands(); }
    if (e.key==='/' && !e.ctrlKey && !e.metaKey && !e.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && !e.target.isContentEditable) { const search=$('#q'); if(search){e.preventDefault();search.focus();search.scrollIntoView({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});} }
    if (!backdrop.classList.contains('open')) return;
    const items = [...list.querySelectorAll('a')];
    if (e.key==='Escape') { closeCommands(); $('#open-command')?.focus(); }
    else if (e.key==='ArrowDown' && items.length) { e.preventDefault(); selected=(selected+1)%items.length; drawCommands(); list.querySelector('[aria-current="true"]')?.scrollIntoView({block:'nearest'}); }
    else if (e.key==='ArrowUp' && items.length) { e.preventDefault(); selected=(selected-1+items.length)%items.length; drawCommands(); list.querySelector('[aria-current="true"]')?.scrollIntoView({block:'nearest'}); }
    else if (e.key==='Enter' && items.length) { e.preventDefault(); items[selected]?.click(); }
  });
  input.addEventListener('input',()=>{selected=0;drawCommands();});
  backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeCommands();});
  list.addEventListener('mousemove',e=>{const a=e.target.closest('[data-command-index]');if(a){selected=Number(a.dataset.commandIndex);list.querySelectorAll('a').forEach(n=>n.removeAttribute('aria-current'));a.setAttribute('aria-current','true');}});
  document.querySelectorAll('.launch-chips a').forEach(a=>a.addEventListener('click',()=>{try{sessionStorage.setItem('amerhwitat.lastWorkspace',a.textContent.trim())}catch(_){}}));
  // Make the header search immediately discoverable from the keyboard.
  const search = $('#q'); if(search) search.setAttribute('aria-keyshortcuts','/ Ctrl+K Meta+K');
})();
