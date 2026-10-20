document.addEventListener('DOMContentLoaded',async()=>{
  const $=id=>document.getElementById(id);
  const log=m=>window.ChimeraAmiga.log(m);
  const ok=await window.ChimeraAmiga.load();
  $('engineStatus').textContent=ok?'Engine: local SAE bundle detected':'Engine: local SAE unavailable; external vAmigaWeb fallback available';
  if(!ok) $('runState').textContent='Fallback is available. Start opens vAmigaWeb in a separate tab; this page cannot claim that the emulator is running.';
  $('cpu').textContent='CPU: 68000';
  $('chipset').textContent='Chipset: OCS';
  $('model').addEventListener('change',e=>{
    const m=e.target.value;
    $('cpu').textContent=m.includes('030')?'CPU: 68030':m==='A1200'?'CPU: 68020':'CPU: 68000';
    $('chipset').textContent=(m==='A1200'||m==='A4000/030')?'Chipset: AGA':'Chipset: OCS/ECS';
    log('Model selected: '+m+' (display profile only until a compatible local core is loaded).');
  });
  $('start').onclick=async()=>{
    const result=await window.ChimeraAmiga.start();
    if(result?.kind==='local') $('runState').textContent='Local SAE started';
    else if(result?.kind==='fallback-opened') $('runState').textContent='vAmigaWeb opened in a new tab; emulator runtime is external to this page.';
    else if(result?.kind==='popup-blocked') $('runState').textContent='Popup blocked. Use the “Launch vAmigaWeb” link above and allow popups if needed.';
    else $('runState').textContent='Start failed; see diagnostics below.';
  };
  $('pause').onclick=()=>{$('runState').textContent=window.ChimeraAmiga.pause()?'Local emulator paused':'Pause is unavailable without the local SAE runtime.';};
  $('reset').onclick=()=>{$('runState').textContent=window.ChimeraAmiga.reset()?'Local emulator reset':'Reset is unavailable without the local SAE runtime.';};
  $('fullscreen').onclick=()=>window.ChimeraAmiga.fullscreen();
  $('rom').onchange=e=>e.target.files[0]&&window.ChimeraAmiga.file('ROM',e.target.files[0]);
  $('df0').onchange=e=>e.target.files[0]&&window.ChimeraAmiga.file('DF0',e.target.files[0]);
  $('df1').onchange=e=>e.target.files[0]&&window.ChimeraAmiga.file('DF1',e.target.files[0]);
  $('hdf').onchange=e=>e.target.files[0]&&window.ChimeraAmiga.file('HDF',e.target.files[0]);
  $('insert0').onclick=()=>log($('df0').files[0]? `DF0 image selected: ${$('df0').files[0].name}. Actual insertion requires a loaded local emulator core.`:'Select a DF0 image first.');
  $('eject0').onclick=()=>log('Eject is unavailable unless a local emulator core is loaded.');
  $('joystick').onclick=()=>log(navigator.getGamepads?'Gamepad API is available; input is not connected until a compatible local emulator core is loaded.':'Gamepad API unavailable.');
  $('screenHost').addEventListener('click',()=>log('Display focused. Keyboard/mouse capture requires a compatible local emulator core.'));
});
