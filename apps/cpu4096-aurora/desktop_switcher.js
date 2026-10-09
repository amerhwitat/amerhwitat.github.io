(() => {
  'use strict';
  const key = 'chimera.desktop.profile';
  const root = document.querySelector('#profiles');
  const status = document.querySelector('#status');
  fetch('desktop_profiles.json', {cache:'no-store'}).then(r => r.json()).then(catalog => {
    const render = () => {
      const current = localStorage.getItem(key) || catalog.default;
      root.innerHTML = catalog.profiles.map(p => `<article class="card" style="padding:20px"><h2>${p.title}</h2><p>${p.family} · ${p.mode}</p><button data-profile="${p.id}">${p.id === current ? 'Current desktop' : 'Switch'}</button></article>`).join('');
      status.textContent = `Current: ${catalog.profiles.find(p => p.id === current)?.title || current}`;
    };
    root.addEventListener('click', e => { const b = e.target.closest('[data-profile]'); if (!b) return; localStorage.setItem(key, b.dataset.profile); render(); window.opener?.postMessage({type:'chimera-desktop-change', id:b.dataset.profile}, '*'); });
    render();
  }).catch(e => { status.textContent = `Unavailable: ${e.message}`; });
})();
