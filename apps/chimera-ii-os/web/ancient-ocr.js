const REGISTRY_URL='/apps/chimera-ii-os/web/ancient-language-registry.json';
const $=id=>document.getElementById(id);
const state={registry:null,file:null,ocr:'',detected:[],translation:null,source:'auto',target:'en',evidence:[]};
const LOCAL_TESS={ 'ancient-greek':'grc','greek':'grc','latin':'lat','ancient-hebrew':'heb','hebrew':'heb','aramaic':'heb','coptic':'cop','old-turkic':'eng','japanese':'jpn','chinese':'chi_tra' };
const TARGET_NAMES={en:'English',ar:'Arabic',zh:'Chinese',ja:'Japanese',de:'German',es:'Spanish',fr:'French',it:'Italian',ko:'Korean',pt:'Portuguese',ru:'Russian',tr:'Turkish',fa:'Persian',ur:'Urdu',hi:'Hindi',id:'Indonesian'};
function addEvidence(x){state.evidence.push(x);$('evidence').textContent=state.evidence.join('\n');}
async function loadRegistry(){
 const r=await fetch(REGISTRY_URL,{cache:'no-store'}); if(!r.ok) throw new Error('registry HTTP '+r.status);
 state.registry=await r.json();
 const src=$('source'); src.innerHTML='<option value="auto">Auto-detect all registered ancient sources</option>'+state.registry.sources.map(x=>`<option value="${x.id}">${x.name}</option>`).join('');
 const tgt=$('target'); tgt.innerHTML=state.registry.targets.map(x=>`<option value="${x.code}">${x.name||TARGET_NAMES[x.code]||x.code}</option>`).join('');
 state.target=tgt.value; addEvidence(`Loaded ${state.registry.sources.length} ancient/source-language profiles and ${state.registry.targets.length} live target languages from amerhwitat/nlp.`);
}
function codepointDetect(text){
 const hits=[]; for(const p of state.registry.sources){let count=0;
   for(const ch of text){const cp=ch.codePointAt(0);if((p.ranges||[]).some(r=>{const [a,b]=r.replace(/^U\+/,'').split('-U+').map(x=>parseInt(x,16));return cp>=a&&cp<=b})) count++}
   if(count) hits.push({id:p.id,name:p.name,count});
 }
 hits.sort((a,b)=>b.count-a.count); return hits;
}
function renderDetected(){ $('detected').innerHTML=state.detected.length?state.detected.map(x=>`<span class="tag">${x.name} · ${x.count}</span>`).join(''):'<span class="small">No registered ancient-script code points detected in the OCR text.</span>'; }
async function localOCR(file){
 if(!window.Tesseract) throw new Error('Tesseract.js unavailable');
 const requested=$('source').value;
 const lang=requested!=='auto'?(LOCAL_TESS[requested]||'eng'):'eng+ara+ell+heb+grc+lat+chi_tra+jpn';
 addEvidence(`Browser OCR model: ${lang}. Ancient scripts without a Tesseract trained model use Unicode detection and the optional NLP API.`);
 const worker=await Tesseract.createWorker(lang);
 try{const r=await worker.recognize(file); return r.data.text||''}finally{await worker.terminate();}
}
async function apiScan(file){
 const base=($('api').value||window.ChimeraPortal?.config?.base||'').replace(/\/+$/,''); if(!base)return null;
 const fd=new FormData(); fd.append('file',file,file.name);
 try{const r=await fetch(base+'/scan_file',{method:'POST',body:fd}); if(!r.ok) throw new Error('scan_file HTTP '+r.status); const data=await r.json(); addEvidence('NLP API /scan_file completed.'); return data.text||data.ocr_text||data.source_text||data.content||null}catch(e){addEvidence('NLP API scan unavailable: '+e.message);return null}
}
async function scan(){
 if(!state.file){$('status').textContent='Select an image first.';return}
 $('status').textContent='Automatic scan running…'; state.evidence=[]; $('translation').textContent='';
 try{
   const remote=await apiScan(state.file); state.ocr=remote||await localOCR(state.file);
   $('ocr').textContent=state.ocr||'(no text recognized)';
   state.detected=codepointDetect(state.ocr); renderDetected();
   if(state.detected.length){state.source=state.detected[0].id; if($('source').value==='auto') $('source').value=state.source; addEvidence('Script detection is Unicode/range evidence; language identity may remain ambiguous.');}
   else addEvidence('No ancient Unicode profile matched; review the OCR text manually.');
   $('status').textContent='Automatic scan complete.';
 }catch(e){$('status').textContent='Scan failed: '+e.message;addEvidence('Error: '+e.message)}
}
async function translate(){
 const text=state.ocr.trim(); if(!text){$('translation').textContent='Run OCR first.';return}
 const base=($('api').value||window.ChimeraPortal?.config?.base||'').replace(/\/+$/,'');
 if(!base){$('translation').textContent='No NLP backend configured. The registered target catalog is loaded, but translation requires a provider/corpus endpoint.';return}
 const source=$('source').value==='auto'?(state.detected[0]?.id||'ancient-north-arabian'):$('source').value;
 try{
  const r=await fetch(base+'/translate_ancient',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({source,text,original_text:text,source_language:source,target_language:$('target').value,source_form:'script'})});
  const data=await r.json(); state.translation=data; $('translation').textContent=JSON.stringify(data,null,2); addEvidence('NLP universal translation endpoint queried; provider/confidence/provenance are preserved.');
 }catch(e){$('translation').textContent='Translation request failed: '+e.message}
}
$('file').onchange=e=>{state.file=e.target.files?.[0]||null;if(state.file)scan()};
$('scan').onclick=scan;$('translate').onclick=translate;$('target').onchange=e=>state.target=e.target.value;
$('export').onclick=()=>{const payload={schema:'chimera-ancient-ocr/v1',timestamp:new Date().toISOString(),source_language:$('source').value,target_language:$('target').value,ocr:state.ocr,detected:state.detected,translation:state.translation,evidence:state.evidence};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));a.download='chimera-ancient-ocr.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
loadRegistry().catch(e=>$('status').textContent='Registry load failed: '+e.message);