(() => {
'use strict';
const $ = (id) => document.getElementById(id);
const HISTORY_KEY = 'dual-os-workbench.chat-history.v1';
const NOTES_KEY = 'dual-os-workbench.notes.v1';
const MAX_MESSAGES = 500;
const OS = {
  chimera: {name:'ChimeraIIOS',desktop:'Aurora Wayland Glass',short:'Aurora',repo:'https://github.com/amerhwitat/ChimeraIIOS',releases:'https://github.com/amerhwitat/ChimeraIIOS/releases/latest',actions:'https://github.com/amerhwitat/ChimeraIIOS/actions',description:'Live, installer and recovery artifacts are published only when the release gates pass.'},
  octavian: {name:'OctavianOS',desktop:'Marine Desktop',short:'Marine',repo:'https://github.com/amerhwitat/OctavianOS',releases:'https://github.com/amerhwitat/OctavianOS/releases/latest',actions:'https://github.com/amerhwitat/OctavianOS/actions',description:'Review the accepted release artifacts and target-specific BIOS/UEFI evidence before installing.'}
};
let selectedOS = 'chimera';
let messages = [];
let conversations = [];
let llmEngine = null;
let rnnModel = null;
let busy = false;
let selectedConversationId = null;
const uid = () => (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'c'+Date.now().toString(36)+Math.random().toString(36).slice(2);
const safeText = (v) => String(v ?? '').slice(0,12000);
function loadArchive() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (data.schema !== 'dual-os-chat-history' || data.version !== 1 || !Array.isArray(data.conversations)) return [];
    return data.conversations.filter(c => c && typeof c.id === 'string' && Array.isArray(c.messages)).slice(-100);
  } catch (e) { console.warn('Could not read chat archive', e); return []; }
}
function saveArchive() {
  try {
    conversations = conversations.slice(-100).map(c => ({...c,messages:(c.messages||[]).slice(-MAX_MESSAGES)}));
    localStorage.setItem(HISTORY_KEY, JSON.stringify({schema:'dual-os-chat-history',version:1,updatedAt:new Date().toISOString(),conversations}));
    $('chatCount').textContent = conversations.reduce((n,c)=>n+c.messages.length,0)+' messages';
    renderHistory();
    return true;
  } catch (e) {
    $('engineStatus').textContent = 'Storage full/unavailable; export your history';
    console.error(e); return false;
  }
}
function currentConversation(create=true) {
  let c = conversations.find(x=>x.id===selectedConversationId);
  if (!c && create) {
    c={id:uid(),title:'New conversation',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),os:selectedOS,messages:[]};
    conversations.push(c); selectedConversationId=c.id;
  }
  return c;
}
function appendMessage(role,content,extra={}) {
  const c=currentConversation();
  const m={id:uid(),role,content:safeText(content),timestamp:new Date().toISOString(),os:selectedOS,...extra};
  c.messages.push(m); c.updatedAt=m.timestamp;
  if (c.messages.filter(x=>x.role==='user').length===1) c.title=m.content.slice(0,64)||'Conversation';
  messages=c.messages;
  saveArchive(); renderMessages(); return m;
}
function renderMessages() {
  const root=$('chatMessages'); root.replaceChildren();
  if (!messages.length) {
    const empty=document.createElement('div'); empty.className='message';
    const who=document.createElement('div'); who.className='who'; who.textContent='WORKBENCH';
    const p=document.createElement('p'); p.textContent='Welcome. Ask a question, load a local model, or configure a trusted inference endpoint. Your chats are stored in this browser and can be exported as JSON.';
    empty.append(who,p); root.append(empty);
  }
  for (const m of messages) {
    const el=document.createElement('article'); el.className='message '+(m.role==='user'?'user':'');
    const who=document.createElement('div'); who.className='who'; who.textContent=m.role==='user'?'YOU':(m.role==='assistant'?'ASSISTANT':'SYSTEM');
    const p=document.createElement('p'); p.textContent=m.content;
    el.append(who,p); root.append(el);
  }
  root.scrollTop=root.scrollHeight;
}
function renderHistory() {
  const root=$('historyList'); if(!root)return; root.replaceChildren();
  [...conversations].reverse().slice(0,20).forEach(c=>{
    const b=document.createElement('button'); b.className='history-item';
    const title=document.createElement('strong'); title.textContent=c.title||'Conversation';
    const meta=document.createElement('small'); meta.textContent=(c.os||'unknown')+' · '+(c.messages||[]).length+' messages · '+new Date(c.updatedAt||c.createdAt).toLocaleDateString();
    b.append(title,meta); b.addEventListener('click',()=>{selectedConversationId=c.id;selectedOS=c.os in OS?c.os:selectedOS;$('osSelect').value=selectedOS;updateOS();messages=c.messages.slice();renderMessages();}); root.append(b);
  });
  if(!root.children.length){const p=document.createElement('p');p.className='small';p.textContent='No saved conversations yet.';root.append(p);}
}
function showView(name) {
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('visible',v.id==='view-'+name));
  document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b.dataset.view===name));
  if(name==='assistant'){renderMessages();renderHistory();$('chatInput').focus({preventScroll:true});}
}
function updateOS() {
  const o=OS[selectedOS]; $('desktopHeading').textContent=o.desktop; $('desktopSub').textContent='A browser workspace inspired by '+o.name+'. Apps below operate in this browser sandbox.'; $('profileStat').textContent=o.short;
  $('installOsTitle').textContent=o.name+' · '+o.short; $('installOsDesc').textContent=o.description;
  $('releaseLink').href=o.releases; $('actionsLink').href=o.actions; $('repoLink').href=o.repo;
  $('browserStatus').textContent=o.short+' · browser sandbox';
  const c=currentConversation(false); if(c && !messages.length){messages=c.messages||[];renderMessages();}
}
function appOpen(name) {
  const views={assistant:'assistant',install:'install',files:'files'};
  if(views[name]){showView(views[name]);return;}
  const win=$('appWindow'); win.classList.remove('hidden'); $('windowTitle').textContent=({terminal:'Terminal',settings:'Settings',status:'System status'}[name]||name);
  const body=$('windowBody'); body.replaceChildren();
  const add=(tag,txt)=>{const e=document.createElement(tag);e.textContent=txt;body.append(e);return e;};
  if(name==='terminal'){
    add('p',selectedOS+' web terminal · safe command simulator (not a host shell).');
    const input=document.createElement('input');input.placeholder='help, status, uname, date, clear';input.className='full';
    const out=add('pre','Type help to list supported simulated commands.');
    const run=document.createElement('button');run.textContent='Run command';
    run.addEventListener('click',()=>{const cmd=input.value.trim().toLowerCase();const answers={help:'help · status · uname · date · ls · clear',status:'Browser UI: running. Native OS boot: not verified by this web page.',uname:selectedOS+' web-sandbox (browser simulation)',date:new Date().toString(),ls:'Desktop/  Documents/  Downloads/  Applications/ (virtual view)',clear:''};out.textContent=answers[cmd]??'Command is not implemented in the sandbox. No host command was executed.';});
    body.append(input,run);
  } else if(name==='settings') {
    add('p','Appearance settings are local to this browser session.');
    const label=document.createElement('label');label.textContent='Interface density ';
    const sel=document.createElement('select');['Comfortable','Compact','Spacious'].forEach(x=>{const o=document.createElement('option');o.textContent=x;sel.append(o);});sel.addEventListener('change',()=>document.body.style.setProperty('--density',sel.value));label.append(sel);body.append(label);
    const p=add('p','Security: browser sandbox only. This UI cannot inspect or control native drivers, processes, disks, or kernel services.');
  } else if(name==='status') {
    add('p','Web UI is interactive. Native process lifecycle, production target boots, installer persistence, recovery postconditions, desktop handshakes, physical SMP, and six hash-bound production traces remain separate acceptance gates.');
    const a=document.createElement('a');a.href='koronos-remediation-status.html';a.textContent='Open current acceptance dashboard ↗';body.append(a);
  }
}
function updateEngineStatus(text){$('engineStatus').textContent=text;$('modelStat').textContent=llmEngine?'Loaded':$('engineSelect').value==='offline'?'Offline helper':'Not loaded';}
async function loadEngine() {
  const mode=$('engineSelect').value; $('loadModel').disabled=true;
  try {
    if(mode==='offline'){llmEngine=null;updateEngineStatus('Offline helper ready; no neural inference');return;}
    if(mode==='rnn'){
      if(!rnnModel) throw new Error('Choose trained-command-isa-rnn.json from the OctavianOS RNN workflow artifact first.');
      llmEngine={mode:'rnn',model:rnnModel}; updateEngineStatus('Trained catalog RNN loaded locally · advisory text continuation'); return;
    }
    if(mode==='webllm') {
      if(!('gpu' in navigator)){throw new Error('WebGPU is unavailable in this browser. Choose an endpoint or offline helper.');}
      updateEngineStatus('Downloading WebLLM runtime/model; first load may be large…');
      const mod=await import('https://esm.run/@mlc-ai/web-llm');
      const model=$('modelName').value.trim()||'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
      const engine=await mod.CreateMLCEngine(model,{initProgressCallback:(p)=>updateEngineStatus(p.text||'Loading model…')});
      llmEngine={mode:'webllm',engine}; updateEngineStatus('Local WebLLM model ready on this browser');
    } else {
      const url=$('endpointUrl').value.trim();
      if(!url || !/^https:\/\//i.test(url)) throw new Error('Enter a trusted HTTPS OpenAI-compatible /v1/chat/completions URL.');
      const u=new URL(url); if(u.username||u.password) throw new Error('Credentials in endpoint URLs are not allowed.');
      llmEngine={mode:'endpoint',url,model:$('modelName').value.trim()||'default'};
      updateEngineStatus('Endpoint configured; request sent only after you chat');
    }
  } catch(e) {llmEngine=null;updateEngineStatus('Engine unavailable: '+e.message);appendMessage('system','Engine unavailable: '+e.message);}
  finally {$('loadModel').disabled=false;}
}
function validateRnnModel(d) {
 if(!d||d.schema!=='CHIMERA-CHAR-RNN-LM-1'||d.model_type!=='trained-character-level-vanilla-RNN') throw new Error('Unsupported RNN model schema.');
 const v=d.vocabulary,h=d.hidden_size;
 if(!Array.isArray(v)||v.length<2||v.length>512||v.some(c=>typeof c!=='string'||c.length!==1)||new Set(v).size!==v.length||!Number.isInteger(h)||h<2||h>64) throw new Error('Invalid RNN vocabulary or hidden size.');
 const shapes={Wxh:[h,v.length],Whh:[h,h],Why:[v.length,h],bh:[h],by:[v.length]};
 for(const [key,shape] of Object.entries(shapes)){
  const value=d[key];
  if(!Array.isArray(value)||value.length!==shape[0]) throw new Error('Invalid RNN tensor '+key);
  if(shape.length===2){if(value.some(row=>!Array.isArray(row)||row.length!==shape[1]||row.some(x=>typeof x!=='number'||!Number.isFinite(x))))throw new Error('Invalid RNN tensor '+key);}
  else if(value.some(x=>typeof x!=='number'||!Number.isFinite(x)))throw new Error('Invalid RNN tensor '+key);
 }
 return d;
}
function rnnGenerate(model,prompt,maxChars=180,temperature=0.8) {
 const vocab=model.vocabulary,index=new Map(vocab.map((c,i)=>[c,i])),h=model.hidden_size;
 const seed=Array.from((prompt||'').slice(-160),c=>index.has(c)?index.get(c):(index.get(' ')??0));
 if(seed.length<1) seed.push(index.get(' ')??0);
 let state=Array(h).fill(0);
 const step=(ix)=>{
  const next=Array(h);
  for(let j=0;j<h;j++){let z=model.Wxh[j][ix]+model.bh[j];for(let k=0;k<h;k++)z+=model.Whh[j][k]*state[k];next[j]=Math.tanh(z);}
  const logits=Array(vocab.length);let peak=-Infinity;
  for(let i=0;i<vocab.length;i++){let z=model.by[i];for(let j=0;j<h;j++)z+=model.Why[i][j]*next[j];logits[i]=z/temperature;peak=Math.max(peak,logits[i]);}
  let total=0;const probs=logits.map(z=>{const p=Math.exp(Math.max(-60,z-peak));total+=p;return p;});
  state=next;let draw=Math.random()*total;
  for(let i=0;i<probs.length;i++){draw-=probs[i];if(draw<=0)return i;}
  return probs.length-1;
 };
 let next=seed[0];
 for(const ix of seed) next=step(ix);
 let out='';
 for(let n=0;n<maxChars;n++){const ch=vocab[next]??' ';out+=ch;if(ch==='\n'&&out.length>24)break;next=step(next);}
 return out.trim()||'(the RNN produced an empty continuation)';
}
function offlineReply(text) {
 const t=text.toLowerCase();
 if(/install|upgrade|iso|usb/.test(t))return 'Install/upgrade guidance: open Install & Upgrade, use the official release page for '+OS[selectedOS].name+', verify the published SHA-256, back up data, and use the project-supported native installer. This browser cannot safely write raw disks or perform a native OS upgrade.';
 if(/rnn|cnn|llm|neural|model/.test(t))return 'Model status: the offline helper is not a neural network. Load WebLLM for local LLM inference (WebGPU + model download required), or configure a trusted HTTPS inference endpoint. RNN/CNN inference requires compatible weights and a runtime adapter; it is not falsely marked active here.';
 if(/kernel|process|smp|service|target|release|daps/.test(t))return 'Acceptance note: browser desktop behavior is not kernel proof. The production gate requires real target payload boots, process/service lifecycle evidence, installer persistence, recovery postconditions, Aurora/Marine handshakes, AP-backed SMP, and six BIOS/UEFI production traces bound to the same ISO SHA-256.';
 return 'I am the transparent offline helper, not a trained LLM. I can route you to the install guide, acceptance dashboard, or model setup. To get generative responses, load WebLLM or configure a trusted HTTPS OpenAI-compatible endpoint.';
}
async function getReply() {
 const user=messages[messages.length-1]?.content||'';
 if(!llmEngine)return offlineReply(user);
 if(llmEngine.mode==='rnn') return 'Catalog-trained character RNN continuation (advisory; not instruction-tuned):\n'+rnnGenerate(llmEngine.model,user);
 if(llmEngine.mode==='webllm'){
  const hist=messages.filter(m=>m.role==='user'||m.role==='assistant').slice(-24).map(m=>({role:m.role,content:m.content}));
  const res=await llmEngine.engine.chat.completions.create({messages:[{role:'system',content:'You are a helpful assistant for ChimeraIIOS and OctavianOS. Be honest about evidence and never claim the browser UI is a native OS.'},...hist],temperature:.5,max_tokens:700});
  return res.choices?.[0]?.message?.content||'The model returned an empty response.';
 }
 if(llmEngine.mode==='endpoint'){
  const hist=messages.filter(m=>m.role==='user'||m.role==='assistant').slice(-24).map(m=>({role:m.role,content:m.content}));
  const res=await fetch(llmEngine.url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:llmEngine.model,messages:hist,temperature:.5})});
  if(!res.ok)throw new Error('Endpoint returned HTTP '+res.status);
  const data=await res.json(); return data.choices?.[0]?.message?.content||data.output_text||'Endpoint returned no recognized assistant text.';
 }
 return offlineReply(user);
}
async function sendMessage(text) {
 if(busy)return; text=text.trim();if(!text)return;
 busy=true;$('sendChat').disabled=true;
 appendMessage('user',text);
 try{const reply=await getReply();appendMessage('assistant',reply,{engine:llmEngine?.mode||'offline'});}
 catch(e){appendMessage('assistant','Request failed: '+e.message+'\nCheck endpoint CORS/network configuration or model availability.',{error:true});}
 finally{busy=false;$('sendChat').disabled=false;$('chatInput').focus();}
}
function downloadJson(name,data) {
 const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportHistory(){downloadJson('dual-os-chat-history.json',{schema:'dual-os-chat-history',version:1,exportedAt:new Date().toISOString(),conversations});}
function renderHistoryState(){messages=currentConversation(false)?.messages||[];renderMessages();renderHistory();}
function bind() {
 document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
 document.querySelectorAll('[data-view-jump]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.viewJump)));
 document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>appOpen(b.dataset.open)));
 $('osSelect').addEventListener('change',()=>{selectedOS=$('osSelect').value;updateOS();const c=currentConversation(false);if(c)c.os=selectedOS;saveArchive();});
 $('closeWindow').addEventListener('click',()=>$('appWindow').classList.add('hidden'));
 $('appFilter').addEventListener('input',e=>{const q=e.target.value.toLowerCase();document.querySelectorAll('.app-card').forEach(c=>c.hidden=!c.textContent.toLowerCase().includes(q));});
 $('engineSelect').addEventListener('change',()=>{llmEngine=null;updateEngineStatus($('engineSelect').value==='offline'?'Offline helper ready':'Load the selected engine to activate it');});
 $('loadModel').addEventListener('click',loadEngine);
 $('rnnModelFile').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>5*1024*1024)throw new Error('Model file exceeds the 5 MiB safety limit.');rnnModel=validateRnnModel(JSON.parse(await file.text()));updateEngineStatus('RNN model loaded; choose the RNN engine and click Load selected engine');if($('engineSelect').value==='rnn')$('loadModel').click();}catch(err){rnnModel=null;updateEngineStatus('RNN model rejected: '+err.message);}finally{e.target.value='';}});
 $('clearModel').addEventListener('click',async()=>{if(llmEngine?.mode==='webllm'){try{await llmEngine.engine.unload();}catch(e){console.warn(e);}}llmEngine=null;updateEngineStatus('Unloaded');});
 $('chatForm').addEventListener('submit',e=>{e.preventDefault();const v=$('chatInput').value;$('chatInput').value='';sendMessage(v);});
 $('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('chatForm').requestSubmit();}});
 $('newChat').addEventListener('click',()=>{selectedConversationId=null;messages=[];currentConversation();renderMessages();renderHistory();});
 $('exportHistory').addEventListener('click',exportHistory);
 $('importHistory').addEventListener('click',()=>$('importFile').click());
 $('importFile').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const data=JSON.parse(await f.text());if(data.schema!=='dual-os-chat-history'||data.version!==1||!Array.isArray(data.conversations))throw new Error('Unsupported JSON schema');const valid=data.conversations.filter(c=>c&&typeof c.id==='string'&&Array.isArray(c.messages)).map(c=>({...c,messages:c.messages.filter(m=>m&&['user','assistant','system'].includes(m.role)&&typeof m.content==='string').slice(-MAX_MESSAGES)}));const ids=new Set(conversations.map(c=>c.id));valid.forEach(c=>{if(!ids.has(c.id)){conversations.push(c);ids.add(c.id);}});saveArchive();selectedConversationId=valid[0]?.id||selectedConversationId;renderHistoryState();$('chatMeta').textContent='Imported '+valid.length+' conversation(s); duplicate IDs skipped.';}catch(err){$('chatMeta').textContent='Import failed: '+err.message;}finally{e.target.value='';}});
 $('clearHistory').addEventListener('click',async()=>{const d=$('confirmDialog');$('dialogTitle').textContent='Clear local chat history?';$('dialogText').textContent='This removes saved conversations from this browser. Export a JSON backup first if needed.';d.showModal();const result=await new Promise(resolve=>d.addEventListener('close',()=>resolve(d.returnValue),{once:true}));if(result==='confirm'){conversations=[];selectedConversationId=null;messages=[];localStorage.removeItem(HISTORY_KEY);currentConversation();saveArchive();renderMessages();$('chatMeta').textContent='Local history cleared.';}});
 $('verifyIso').addEventListener('click',async()=>{const file=$('isoFile').files?.[0],expected=$('expectedHash').value.trim().toLowerCase();const out=$('verifyResult');if(!file){out.textContent='Select an ISO first.';return;}if(!/^[a-f0-9]{64}$/.test(expected)){out.textContent='Enter the trusted published 64-character SHA-256 first.';return;}if(!crypto.subtle){out.textContent='Web Crypto is unavailable. Use a trusted local sha256sum tool instead.';return;}out.textContent='Hashing '+file.name+'…';try{const digest=await crypto.subtle.digest('SHA-256',await file.arrayBuffer());const actual=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');out.textContent=(actual===expected?'PASS — SHA-256 matches. This verifies bytes only, not release authenticity or OS acceptance. ':'FAIL — SHA-256 mismatch. Do not install this image. ')+'Actual: '+actual;}catch(err){out.textContent='Could not hash file: '+err.message;}});
 $('saveNotes').addEventListener('click',()=>{try{localStorage.setItem(NOTES_KEY,$('notes').value);$('notesStatus').textContent='Saved locally';}catch(e){$('notesStatus').textContent='Storage unavailable: '+e.message;}});
 $('exportNotes').addEventListener('click',()=>downloadJson('workspace-notes.json',{schema:'dual-os-workspace-notes',version:1,updatedAt:new Date().toISOString(),notes:$('notes').value}));
}
function init(){
 conversations=loadArchive();selectedConversationId=conversations.at(-1)?.id||null;
 if(selectedConversationId){const c=currentConversation(false);messages=c?.messages||[];selectedOS=c?.os in OS?c.os:'chimera';$('osSelect').value=selectedOS;} else {currentConversation();messages=[];}
 updateOS();renderMessages();renderHistory();$('chatCount').textContent=conversations.reduce((n,c)=>n+c.messages.length,0)+' messages';
 try{$('notes').value=localStorage.getItem(NOTES_KEY)||'';}catch(e){}
 bind();
}
document.addEventListener('DOMContentLoaded',init);
})();