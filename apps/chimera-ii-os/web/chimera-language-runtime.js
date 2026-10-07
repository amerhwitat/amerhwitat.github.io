(()=>{"use strict";
const C="chimera-language-runtime-catalog.json";
const $=id=>document.getElementById(id);
const escape=s=>String(s).replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]));
const adapters=[
 ["ASM / S","Native ISA + JS/WASM adapter","boot and architecture assembly is catalogued; browser execution uses an emulator boundary."],
 ["C","WASM + local native bridge","C userland and boot/runtime components can be compiled in CI; privileged execution stays local."],
 ["C++","WASM + local native bridge","Kernel, ISO-Tool and mobile C++ surfaces map to modern WASM/native adapters."],
 ["Python","Pyodide + Python bridge","Pure browser Python can use Pyodide; filesystem/device/build work uses the local bridge."],
 ["Kotlin","Kotlin/JVM + Kotlin/WASM","Desktop/mobile services can target JVM/WASM; Android builds remain native."],
 ["Java","JVM + TeaVM/WASM","Java sources can target JVM or browser WASM/JS through a build step."],
 ["Java Applet","Legacy descriptor","Not executed by modern browsers; retained as a compatibility/export target."],
 ["ActiveX / COM","Legacy descriptor","Not executed by modern browsers; Windows host integration requires an authorized native COM host."]
];
function render(d){
 const entries=Object.entries(d.counts);
 $("stats").innerHTML=entries.map(([k,v])=>'<div class="glass card"><div class="eyebrow">'+escape(k)+'</div><div class="stats">'+v+'</div><div>tracked source files</div></div>').join('');
 $("targets").innerHTML='<div class="glass card"><div class="eyebrow">TOTAL</div><div class="stats">'+d.totalTrackedFiles+'</div><div>tracked source/header files at '+escape(d.sourceCommit.slice(0,12))+'</div></div>';
 $("matrix").innerHTML=adapters.map(a=>'<article class="glass card"><h3>'+escape(a[0])+'</h3><span class="pill">'+escape(a[1])+'</span><p class="note">'+escape(a[2])+'</p></article>').join('');
 $("console").textContent="Aurora Runtime Lab ready.\nGuest session: browser-safe control enabled.\nSource commit: "+d.sourceCommit+"\nTracked files: "+d.totalTrackedFiles+"\n\nCounts:\n"+entries.map(([k,v])=>"  "+k.padEnd(8)+" "+v).join("\n")+"\n\nModern browser target: JS/WASM. Legacy Applet/ActiveX are descriptors, not executable browser plugins.";
}
fetch(C,{cache:"no-store"}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(render).catch(e=>{$("console").textContent+="\nCatalog load failed: "+e.message;});
})();