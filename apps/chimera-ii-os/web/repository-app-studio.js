(()=>{"use strict";
const apps=[
["bruteforce","Computational Search Research","Safe search-space visualizer, deterministic crypto/public-data research, validation and benchmarks.","web","web/javascript/index.html","https://github.com/amerhwitat/bruteforce"],
["bruteforce","Java Research Runner","Java 21 interoperability/conformance track; launch through local Aurora Code IDE/bridge.","java","https://github.com/amerhwitat/bruteforce/tree/main/java","https://github.com/amerhwitat/bruteforce"],
["bruteforce","Crypto Research GUI","Safe educational cryptography GUI and deterministic test harness.","native","https://github.com/amerhwitat/bruteforce/blob/main/crypto_research_gui.py","https://github.com/amerhwitat/bruteforce"],
["VanG","Aurora / 128D P2P Shell","Aurora integration, desktop synchronization and authenticated 128D/P2P application boundary.","native","https://github.com/amerhwitat/VanG","https://github.com/amerhwitat/VanG"],
["test","Chimera Research Platform","8192-bit R8192, 1024-register model, assembler/disassembler, kernel, memory, networking, robotics, NLP/OCR and PDF boundaries.","native","https://github.com/amerhwitat/test","https://github.com/amerhwitat/test"],
["test","Python Runtime Adapter","Host-side Python startup/conformance target; executable through the local Aurora Python bridge.","native","https://github.com/amerhwitat/test/blob/main/start_chimera.py","https://github.com/amerhwitat/test"],
["eth-key-check","Ethereum Verification Lab","Owner-authorized address/key verification, public blockchain observation and deterministic crypto research.","web","https://github.com/amerhwitat/eth-key-check/tree/main/web","https://github.com/amerhwitat/eth-key-check"],
["eth-key-check","Java Crypto Conformance","Java implementation track for deterministic public/synthetic vectors and verification.","java","https://github.com/amerhwitat/eth-key-check/tree/main/java","https://github.com/amerhwitat/eth-key-check"],
["eth-key-check","Python Crypto Utilities","Python implementation for deterministic verification and public-data research.","native","https://github.com/amerhwitat/eth-key-check/tree/main/python","https://github.com/amerhwitat/eth-key-check"],
["keygen","Koronos Keygen Research","Key-generation research, Koronos runtime, knowledge bus and 128D interoperability.","native","https://github.com/amerhwitat/keygen","https://github.com/amerhwitat/keygen"],
["general","Research Forge","Deep research, crawler, code search, document index, project builder and artifact workflows.","native","https://github.com/amerhwitat/general","https://github.com/amerhwitat/general"],
["general","Apple / Cross-platform Boundaries","Centralized Apple Objective-C/SwiftUI/Flutter integration surfaces for portfolio projects.","native","https://github.com/amerhwitat/general/tree/master/Apple-Implementations","https://github.com/amerhwitat/general"]
];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const q=document.getElementById("q"),f=document.getElementById("filter"),g=document.getElementById("grid"),out=document.getElementById("console");
function log(s){out.value+=("\n"+s);out.scrollTop=out.scrollHeight}
function render(){const z=q.value.toLowerCase(),t=f.value;g.innerHTML=apps.filter(a=>(t==="all"||a[3]===t)&&a.join(" ").toLowerCase().includes(z)).map(a=>'<article class="card"><span class="tag">'+esc(a[3].toUpperCase())+'</span><h2>'+esc(a[0])+" · "+esc(a[1])+'</h2><p class="muted">'+esc(a[2])+'</p><div class="actions"><a class="btn primary" href="'+a[4]+'" target="_blank" rel="noopener" onclick="window.__log(\'Launch '+a[0]+': '+a[1]+'\')">Launch</a><a class="btn" href="'+a[5]+'" target="_blank" rel="noopener">Source</a></div></article>').join("")||'<article class="card">No matching applications.</article>'}
window.__log=log;q.oninput=render;f.onchange=render;render();
localStorage.setItem("aurora_guest_session",JSON.stringify({role:"Guest",passwordRequired:false,created:new Date().toISOString(),scope:"browser-safe applications"}));
})();