/* Shared site-wide interaction sounds and workflow routing. Audio starts only after user input. */
(() => {
  'use strict';
  if (window.__siteInteractionLayerLoaded) return;
  window.__siteInteractionLayerLoaded = true;
  const KEY = 'amerhwitat.site.sounds';
  let soundOn = false, audio = null, statusTimer = 0;
  try { soundOn = localStorage.getItem(KEY) === 'on'; } catch (_) { soundOn = false; }
  const status = document.createElement('div');
  status.className = 'site-workflow-status'; status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
  document.addEventListener('DOMContentLoaded', () => {
    if (!document.body) return;
    document.body.appendChild(status);
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'site-sound-toggle'; toggle.setAttribute('aria-pressed',String(soundOn));
    toggle.setAttribute('aria-label','Toggle interface interaction sounds');
    toggle.title = 'Sound effects are off until you enable them. Shortcut: Ctrl/⌘+Shift+S';
    const drawToggle = () => { toggle.textContent = (soundOn ? '🔊' : '🔇') + ' UI sounds'; toggle.setAttribute('aria-pressed',String(soundOn)); };
    toggle.addEventListener('click', () => { soundOn = !soundOn; try { localStorage.setItem(KEY,soundOn?'on':'off'); } catch (_) {} drawToggle(); toggle.title = soundOn ? 'Sound effects enabled. Click to mute.' : 'Sound effects are off. Click to enable.'; if(soundOn) tone('click'); announce('Interface sounds '+(soundOn?'enabled':'muted')); });
    drawToggle(); document.body.appendChild(toggle);
  });
  function tone(kind) {
    if (!soundOn) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audio) audio = new Ctx();
      if (audio.state === 'suspended') audio.resume();
      const now = audio.currentTime, osc = audio.createOscillator(), gain = audio.createGain();
      const dbl = kind === 'double';
      osc.type = dbl ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(dbl ? 880 : 620, now);
      if (dbl) osc.frequency.exponentialRampToValueAtTime(1320, now + .075);
      gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(.025, now + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, now + (dbl ? .13 : .065));
      osc.connect(gain); gain.connect(audio.destination); osc.start(now); osc.stop(now + (dbl ? .14 : .075));
    } catch (_) { /* Audio is an optional enhancement; interaction still works. */ }
  }
  function announce(message) {
    if (!status.isConnected) return;
    status.textContent = message; status.classList.add('visible');
    clearTimeout(statusTimer); statusTimer = setTimeout(() => status.classList.remove('visible'), 2200);
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('button,a,[role="button"],[data-action],[data-workflow],[data-route]');
    if (!target) return;
    if (!target.classList.contains('site-sound-toggle')) tone('click');
    const route = target.dataset.route || target.dataset.workflow;
    if (route) {
      event.preventDefault();
      if (route.startsWith('#')) { document.querySelector(route)?.scrollIntoView({behavior:'smooth',block:'start'}); announce('Opened section '+route); }
      else if (/^https?:\/\//i.test(route)) { window.open(route,'_blank','noopener,noreferrer'); announce('Opening linked workflow'); }
      else { window.location.href = route; }
      return;
    }
    if (target.dataset.action) {
      const action = target.dataset.action;
      if (action === 'sound-toggle') { document.querySelector('.site-sound-toggle')?.click(); return; }
      if (action === 'scroll-top') { window.scrollTo({top:0,behavior:'smooth'}); announce('Returned to top'); return; }
      if (action === 'reload') { announce('Refreshing this application'); window.location.reload(); return; }
      if (action === 'open-source') { window.open(target.dataset.url || 'https://github.com/amerhwitat/amerhwitat.github.io','_blank','noopener,noreferrer'); return; }
      target.dispatchEvent(new CustomEvent('site:workflow',{bubbles:true,detail:{action}}));
    }
  }, true);
  document.addEventListener('dblclick', event => {
    const target = event.target.closest('button,a,[role="button"],[data-double-route]');
    if (!target) return;
    tone('double');
    const route = target.dataset.doubleRoute;
    if (route) { event.preventDefault(); if (/^https?:\/\//i.test(route)) window.open(route,'_blank','noopener,noreferrer'); else window.location.href = route; }
    else if (target.matches('button[data-app],button[data-registry-app],.app-card,.dock button')) {
      // Double-click repeats the actual registered activation, not a decorative no-op.
      target.click();
    }
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 's') {
      event.preventDefault(); document.querySelector('.site-sound-toggle')?.click();
    }
  });
})();
