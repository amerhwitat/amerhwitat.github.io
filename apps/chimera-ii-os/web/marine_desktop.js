(() => {
  'use strict';
  const root = document.getElementById('marineDesktop');
  const panel = document.getElementById('backgroundPanel');
  const start = document.getElementById('startMenu');
  const startButton = document.getElementById('startButton');
  const allowed = new Set(['marine-desktop.svg','chimera-hero-3840x2160.svg','octavian-celestial-octopus-3840x2160.svg','https://images.unsplash.com/photo-1717293520171-b1d8b5d5e3f2?auto=format&fit=crop&w=3840&q=90','https://images.unsplash.com/photo-1786335091902-eb0166246cbe?auto=format&fit=crop&w=3840&q=90','https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=3840&q=90']);
  function applyBackground(asset) {
    if (!allowed.has(asset)) return;
    root.style.backgroundImage = 'linear-gradient(180deg,rgba(1,17,31,.22),rgba(1,17,31,.2)),url("' + asset + '")';
    localStorage.setItem('chimera.desktop.background', asset);
    document.querySelectorAll('[data-background]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.background === asset)));
    window.dispatchEvent(new CustomEvent('chimera-background-change', {detail:{asset}}));
  }
  function togglePanel(open) { panel.classList.toggle('hidden', !open); }
  document.querySelectorAll('[data-background]').forEach(button => button.addEventListener('click', () => applyBackground(button.dataset.background)));
  document.getElementById('wallpaperToggle').addEventListener('click', () => togglePanel(panel.classList.contains('hidden')));
  document.getElementById('chooseBackground').addEventListener('click', () => togglePanel(true));
  document.getElementById('closeBackgrounds').addEventListener('click', () => togglePanel(false));
  startButton.addEventListener('click', () => {
    const open = start.classList.contains('hidden');
    start.classList.toggle('hidden', !open);
    startButton.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { togglePanel(false); start.classList.add('hidden'); startButton.setAttribute('aria-expanded','false'); }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); document.getElementById('appSearch').focus(); }
  });
  document.getElementById('appSearch').addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    const term = event.currentTarget.value.trim().toLowerCase();
    const matches = [...document.querySelectorAll('.desktop-icon')].filter(item => item.textContent.toLowerCase().includes(term));
    if (matches.length === 1) matches[0].click();
    else if (term.includes('wallpaper') || term.includes('background')) togglePanel(true);
    else if (term.includes('aurora')) location.href = 'aurora_3d_desktop.html';
    else if (term.includes('acceptance') || term.includes('status')) location.href = 'userspace-acceptance.html';
    else if (term.includes('profile') || term.includes('desktop')) location.href = 'desktop_switcher.html';
  });
  function tick() { const now = new Date(); document.getElementById('clock').textContent = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); }
  tick(); setInterval(tick, 15000);
  applyBackground(localStorage.getItem('chimera.desktop.background') || 'https://images.unsplash.com/photo-1717293520171-b1d8b5d5e3f2?auto=format&fit=crop&w=3840&q=90');
})();