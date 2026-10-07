(() => {
'use strict';
const apps=[
["System Control","OS health, services, processes, performance and settings","system_control_center.html"],
["Wallet Center","Wallet simulation, Python catalog, build and local execution","wallet-center.html"],
["Python Code Wallet","691 Python files, entrypoints, modules and tests","wallet-center.html?focus=python"],
["Code IDE","C/C++ build/run/debug workspace","chimera_code_ide.html"],
["Game Center","Game library, saves, XP and interactive gameplay","game-center.html"],
["MAME Center","Arcade emulator controls, media and states","mame-center.html"],
["ISO & Flash Center","ISO inspection, verification and safety-gated local flashing","iso-flash-center.html"],
["Ecosystem Center","All owned repositories, feature domains and browser utilities","aurora-ecosystem-center.html"],
["Retro Emulators","Multi-system emulator launcher","retro_emulators.html"],
["PlayStation Hub","PS1–PS5 emulator catalog and local launch bridge","playstation_emulators.html"],
["Network Engine","Network configuration and P2P integration","network-engine.html"],
["Network Monitor","Live network diagnostics","network_monitor.html"],
["Ancient OCR","Ancient-language OCR and transliteration","ancient-ocr.html"],
["OCR Studio","Document/image OCR workspace","ocr-studio.html"],
["Research Lab","Crypto, AI and experimental research integrations","research-lab.html"],
["ISA Explorer","Instruction-set and architecture exploration","isa-explorer.html"],
["PDF Reader","Browser PDF document viewer","pdf-reader.html"],
["Health","Runtime health and diagnostics","health.html"],
["Crash Center","Crash and recovery diagnostics","crash_center.html"],
["Desktop Switcher","Aurora desktop profiles","desktop_switcher.html"],
["Aurora 3D Desktop","Interactive WebGL desktop","aurora_3d_desktop.html"],
["Aurora Terminal","Cross-platform sandboxed command catalog","aurora_terminal.html"],
["Hercules Runtime","External Chimera II application runtime","https://chimera-iios-120143.onhercules.app/"]
];
const domains=[
["Aurora Wayland Glass","3D desktop, launcher, profiles, widgets and visual shell"],
["Koronos / System","kernel model, health, crash recovery, ISO and flash workflows"],
["8192-bit ISA","ISA Explorer, registry, architecture and compatibility layers"],
["Emulation","MAME, Amiga, retro systems, PlayStation and game workflows"],
["Developer Tools","Code IDE, Python wallet, terminal, diagnostics and API tooling"],
["Research","Ancient OCR, NLP, PDF, crypto/AI research and experimental labs"],
["Network / P2P","Network Engine, Network Monitor and local bridge integrations"],
["Games","Game Center, original AAA prototypes, retro and emulator surfaces"],
["Ecosystem","14-repository portfolio plus original browser utilities"],
["Hercules","External runtime integrated as a remote application surface"]
];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=id=>document.getElementById(id);
function render(){
 const q=$('search').value.toLowerCase();
 $('apps').innerHTML=apps.filter(a=>a.join(' ').toLowerCase().includes(q)).map(a=>{
 const ext=/^https?:/.test(a[2]);
 return '<article class="card"><span class="status">'+(ext?'REMOTE':'AURORA')+'</span><h3>'+esc(a[0])+'</h3><p>'+esc(a[1])+'</p><a class="btn primary" '+(ext?'target="_blank" rel="noopener"':'')+' href="'+a[2]+'">Launch</a></article>';
 }).join('');
 $('domains').innerHTML=domains.map(d=>'<article class="card"><h3>'+esc(d[0])+'</h3><p>'+esc(d[1])+'</p></article>').join('');
}
$('search').oninput=render;render();
})();