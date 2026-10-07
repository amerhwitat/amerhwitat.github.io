const CATALOG=[
["BizXtreme Crypto","Bitcoin/UTXO, EVM, Solana/SPL, TON, chain adapters, watch-only, receive, intents, buy/sell/swap/sweep planning","native contract"],
["BizXtreme WebGL/Mobile","connect/disconnect, accounts, chain, balances, prepare/sign/broadcast/status, encrypted backup","provider adapter"],
["NetworkUnified","health, config, interfaces, classify, authorize, bounded TCP checks","allowlist only"],
["P2P / Presence","sessions, presence, multiplayer adapters, authenticated peer research","safe-lab"],
["BizXtreme AI","ML, DL, RL, symbolic AI, CV, NLP, shared job contracts","model adapter"],
["Asset Browser","open-license discovery, provenance, SHA-256, import planning","browser/local"],
["Bruteforce research","hashing, checksums, public vectors, benchmarks, safe restore-and-verify","research only"],
["Wallet compatibility","HD accounts, QR, hardware signer, multisig, passkeys, encrypted backup, dApp pairing","interface catalog"],
["Aurora Smart Model","click learning, RNN learner, optional browser Transformer LLM, policy explanation","browser AI"],
["Chimera","Koronos, ISA registry, Universal Execution API, Nucleus/Hive integration","OS integration"]
];
const $=id=>document.getElementById(id);
function event(action,element){try{const k="chimera-learning";const a=JSON.parse(localStorage.getItem(k)||"[]");a.push({schema:"chimera-user-learning/v1",timestamp:new Date().toISOString(),page:"wallet-center",element,action});localStorage.setItem(k,JSON.stringify(a.slice(-10000)))}catch{}}
function publicState(){return{schema:"aurora-wallet-research/v1",network:$("network").value,address:$("address").value.trim(),asset:$("asset").value.trim(),amount:$("amount").value,recipient:$("recipient").value.trim(),mode:"watch-only",timestamp:new Date().toISOString()}}
function render(){ $("catalog").innerHTML=CATALOG.map(x=>`<tr><td><b>${x[0]}</b></td><td>${x[1]}</td><td>${x[2]}</td></tr>`).join("")}
$("observe").onclick=()=>{event("observe","observe");$("output").textContent=JSON.stringify({...publicState(),operation:"OBSERVE",ownership:"WATCH_ONLY",note:"Public observation does not prove control."},null,2)}
$("intent").onclick=()=>{event("prepare-intent","intent");$("output").textContent=JSON.stringify({...publicState(),operation:"TRANSACTION_INTENT",status:"READY_FOR_USER_WALLET_APPROVAL",signing:"external-provider-only"},null,2)}
$("backup").onclick=()=>{event("simulate-backup","backup");$("output").textContent="Encrypted-backup workflow simulated. No seed phrase/private key was requested, generated, stored, copied or uploaded."}
$("export").onclick=()=>{event("export-public-json","export");const b=new Blob([JSON.stringify(publicState(),null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="aurora-wallet-public-research.json";a.click();URL.revokeObjectURL(u)}
render();

let PY=null;
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
async function loadPythonCatalog(){
  $("pyStatus").textContent="Loading Python catalog…";
  try{const r=await fetch("wallet-python-catalog.json",{cache:"no-store"});if(!r.ok)throw Error("catalog HTTP "+r.status);PY=await r.json();
    $("pyRepo").innerHTML='<option value="">All repositories</option>'+PY.repositories.map(x=>'<option>'+esc(x.repo)+'</option>').join("");
    $("pyStatus").textContent=PY.summary.total_python_files+" Python files across "+PY.summary.repositories+" repositories.";
    renderPython();
  }catch(e){$("pyStatus").textContent="Python catalog unavailable: "+e.message}
}
function renderPython(){
 if(!PY)return;const q=$("pySearch").value.toLowerCase(),repo=$("pyRepo").value,kind=$("pyKind").value;
 const rows=PY.files.filter(x=>(!repo||x.repo===repo)&&(!kind||x.kind===kind)&&(!q||(x.repo+" "+x.path+" "+x.kind).toLowerCase().includes(q)));
 $("pyStatus").textContent=rows.length+" matching Python files · "+PY.summary.total_python_files+" indexed total.";
 $("pyCatalog").innerHTML=rows.map(x=>'<tr><td><b>'+esc(x.repo)+'</b></td><td><code>'+esc(x.path)+'</code></td><td><span class="pill">'+esc(x.kind)+'</span></td><td class="code-count">'+Number(x.size).toLocaleString()+" B</td><td class="code-action"><a class="btn" href=""+esc(x.url)+"" target="_blank" rel="noopener">Source</a><button class="btn" data-pycopy=""+esc(x.url)+"">Copy URL</button></td></tr>").join("")||'<tr><td colspan="5">No matching Python files.</td></tr>';
 $("pyCatalog").querySelectorAll("[data-pycopy]").forEach(b=>b.onclick=async()=>{try{await navigator.clipboard.writeText(b.dataset.pycopy);b.textContent="Copied";setTimeout(()=>b.textContent="Copy URL",1200)}catch{prompt("Copy source URL:",b.dataset.pycopy)}});
}
["pySearch","pyRepo","pyKind"].forEach(id=>$(id).oninput=$(id).onchange=renderPython);
$("pyRefresh").onclick=()=>{event("refresh-python-catalog","pyRefresh");loadPythonCatalog()};
$("pyExport").onclick=()=>{event("export-python-catalog","pyExport");if(!PY)return;const b=new Blob([JSON.stringify(PY,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="chimera-python-catalog.json";a.click();URL.revokeObjectURL(u)};
loadPythonCatalog();
