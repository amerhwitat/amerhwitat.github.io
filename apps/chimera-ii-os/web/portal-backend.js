/* Aurora Portal Backend Adapter */
(()=>{'use strict';
const storage=(key,value)=>{try{if(value===undefined)return localStorage.getItem(key)||'';if(value)localStorage.setItem(key,value);else localStorage.removeItem(key)}catch{}};
const cfg={
 get base(){return (storage('chimera.backend.url')||document.querySelector('meta[name="chimera-backend"]')?.content||'').replace(/\/+$/,'')},
 set base(v){storage('chimera.backend.url',String(v||'').trim().replace(/\/+$/,''))},
 get token(){return storage('chimera.backend.token')},
 set token(v){storage('chimera.backend.token',String(v||'').trim())},
 get session(){let id=storage('chimera.backend.session');if(!id){id=(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));storage('chimera.backend.session',id)}return id},
 staticHost:location.hostname.endsWith('.github.io')||location.hostname.endsWith('.githubusercontent.com')
};
async function request(path,options={}){
 if(!cfg.base)throw new Error('Local backend URL is not configured');
 const init={...options,headers:{accept:'application/json',...(options.headers||{})}};
 const r=await fetch(cfg.base+path,init),type=r.headers.get('content-type')||'';
 const data=type.includes('json')?await r.json():await r.text();
 if(!r.ok)throw new Error((data&&data.error)||('HTTP '+r.status));
 return data;
}
async function health(){try{return await request('/health')}catch(e){return {ok:false,error:e.message,mode:'browser-only'}}}
async function capabilities(){if(!cfg.token)throw new Error('Paste the local bearer token first');return request('/api/capabilities',{headers:{authorization:'Bearer '+cfg.token}})}
async function connect(){const h=await health();if(!h.ok)throw new Error(h.error||'Local bridge unavailable');return capabilities()}
async function command(command,os,shell){
 if(!cfg.base||!cfg.token)return {ok:false,mode:'local-bridge-required',error:'Set the local bridge URL and bearer token, then connect.'};
 try{
  const result=await request('/api/command',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+cfg.token},
   body:JSON.stringify({command,os,shell:shell||null,session:cfg.session})});
  if(result.session)storage('chimera.backend.session',result.session);
  return result;
 }catch(e){return {ok:false,mode:'local-bridge-error',error:e.message,command,os,shell:shell||null}}
}
function native(scheme,payload){const q=new URLSearchParams(payload||{});location.href=scheme+'?'+q.toString()}
window.ChimeraPortal={config:cfg,request,health,capabilities,connect,command,native,isStaticPages:cfg.staticHost};
})();
