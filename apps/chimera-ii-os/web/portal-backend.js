/* Aurora Portal Backend Adapter */
(()=>{'use strict';
const cfg={get base(){return (document.querySelector('meta[name="chimera-backend"]')?.content||localStorage.getItem('chimera.backend.url')||'').replace(/\/+$/,'')},set base(v){const x=String(v||'').trim().replace(/\/+$/,'');if(x)localStorage.setItem('chimera.backend.url',x);else localStorage.removeItem('chimera.backend.url')},staticHost:location.hostname.endsWith('.github.io')||location.hostname.endsWith('.githubusercontent.com')};
async function request(path,options={}){const url=(cfg.base||'')+path;const init={...options,headers:{accept:'application/json',...(options.headers||{})}};const r=await fetch(url,init);const type=r.headers.get('content-type')||'';const data=type.includes('json')?await r.json():await r.text();if(!r.ok)throw new Error((data&&data.error)||('HTTP '+r.status));return data}
async function first(paths,options){let last;for(const p of paths){try{return await request(p,options)}catch(e){last=e}}throw last||new Error('backend unavailable')}
async function health(){try{return await first(['/health','/api/health'])}catch{return {ok:false,mode:cfg.base?'configured-backend-unavailable':'github-pages-static'}}}
async function command(command,os){try{return await request('/api/command',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({command,os})})}catch(e){return {ok:false,mode:'native-handoff',error:e.message,command,os}}}
function native(scheme,payload){const q=new URLSearchParams(payload||{});location.href=scheme+'?'+q.toString()}
window.ChimeraPortal={config:cfg,request,first,health,command,native,isStaticPages:cfg.staticHost};
})();