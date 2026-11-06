const $ = s => document.querySelector(s);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Self-contained WebGL 2 / WebGL 1 scene: no CDN or third-party renderer required.
const canvas = $('#aurora3d');
const gl = canvas && (canvas.getContext('webgl2',{alpha:true,antialias:true}) || canvas.getContext('webgl',{alpha:true,antialias:true}));
window.AuroraWebGLActive = Boolean(gl);
if (gl) {
  const webgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  const vs1='attribute vec2 p; varying vec2 uv; void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const fs1='precision highp float; varying vec2 uv; uniform float t; uniform vec2 res; void main(){vec2 p=(uv-.5)*vec2(res.x/max(res.y,1.),1.);float time=t*.12;float ridge=.28+.08*sin(p.x*1.8+time)+.03*sin(p.x*5.);float glow=exp(-pow(p.y-ridge,2.)*25.)*(.4+.6*(.5+.5*sin(p.x*3.+time)));float stars=step(.997,fract(sin(dot(floor(uv*res*.08),vec2(12.9,78.2)))*43758.5));vec3 c=mix(vec3(.006,.014,.04),vec3(.02,.1,.17),uv.y)+vec3(.1,.7,.98)*glow+vec3(.5,.7,1.)*stars*.7;gl_FragColor=vec4(c,.9);}';
  const vs2='#version 300 es\nin vec2 p; out vec2 uv; void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const fs2='#version 300 es\nprecision highp float; in vec2 uv; uniform float t; uniform vec2 res; out vec4 color; void main(){vec2 p=(uv-.5)*vec2(res.x/max(res.y,1.),1.);float time=t*.12;float ridge=.28+.08*sin(p.x*1.8+time)+.03*sin(p.x*5.);float glow=exp(-pow(p.y-ridge,2.)*25.)*(.4+.6*(.5+.5*sin(p.x*3.+time)));float stars=step(.997,fract(sin(dot(floor(uv*res*.08),vec2(12.9,78.2)))*43758.5));vec3 c=mix(vec3(.006,.014,.04),vec3(.02,.1,.17),uv.y)+vec3(.1,.7,.98)*glow+vec3(.5,.7,1.)*stars*.7;color=vec4(c,.9);}';
  function compile(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh)||'shader compile failed');return sh;}
  try {
    const program=gl.createProgram(),v=compile(gl.VERTEX_SHADER,webgl2?vs2:vs1),f=compile(gl.FRAGMENT_SHADER,webgl2?fs2:fs1);
    gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program)||'shader link failed');
    const pos=gl.getAttribLocation(program,'p'),time=gl.getUniformLocation(program,'t'),res=gl.getUniformLocation(program,'res'),buffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.floor(innerWidth*d));canvas.height=Math.max(1,Math.floor(innerHeight*d));gl.viewport(0,0,canvas.width,canvas.height);}
    function draw(now){gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);gl.uniform1f(time,now/1000);gl.uniform2f(res,canvas.width,canvas.height);gl.drawArrays(gl.TRIANGLES,0,3);requestAnimationFrame(draw);}
    addEventListener('resize',resize);resize();requestAnimationFrame(draw);
    document.documentElement.dataset.webgl=webgl2?'2':'1';
  } catch(error){window.AuroraWebGLActive=false;canvas.style.display='none';console.warn('WebGL unavailable; using CSS fallback',error);}
} else if(canvas) { canvas.style.display='none'; }
let profiles=[];
const fallbackProfiles=[
 ['aurora','Aurora Wayland Glass','linux'],['gnome','GNOME','linux'],['kde-plasma','KDE Plasma','linux'],['xfce','Xfce','linux'],['cinnamon','Cinnamon','linux'],['mate','MATE','linux'],['lxqt','LXQt','linux'],['lxde','LXDE','linux'],['budgie','Budgie','linux'],['pantheon','Pantheon','linux'],['deepin','Deepin','linux'],['enlightenment','Enlightenment','linux'],['cosmic','COSMIC','linux'],['windows-11','Windows 11','windows'],['windows-10','Windows 10','windows'],['windows-classic','Classic Windows','windows']
];
const help=[
 ['linux','ls','list directory contents','1'],['linux','bash','GNU Bourne Again shell','1'],['linux','gcc','GNU C compiler','1'],['linux','g++','GNU C++ compiler','1'],['linux','cmake','cross-platform build system','1'],['linux','systemctl','control the systemd system and service manager','1'],
 ['windows','cmd','Windows Command Prompt reference','windows'],['windows','winget','Windows Package Manager command reference','windows'],['powershell','Get-Process','Gets processes running on a computer','powershell'],['powershell','Get-Help','Displays help about PowerShell commands and concepts','powershell'],
 ['chimera','chimera-isa','Chimera II instruction-set reference','1'],['chimera','chimera-help','Unified Chimera II documentation command','1'],['toolchain','clang','C/C++ compiler toolchain reference','1'],['toolchain','ninja','Small build system reference','1']
];
function setProfile(id,name){localStorage.setItem('chimera.desktop.profile',id); $('#profile').textContent=name;}
function renderProfiles(){const menu=$('#profileMenu'); menu.innerHTML='<b>Desktop Profiles</b>'+profiles.map(p=>`<button data-profile="${esc(p.id)}">${esc(p.name)} <small>· ${esc(p.platform)}</small></button>`).join(''); menu.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>{const p=profiles.find(x=>x.id===b.dataset.profile);if(p)setProfile(p.id,p.name);menu.classList.add('hidden')});}
function open(id){document.querySelectorAll('.app-window').forEach(w=>w.classList.add('hidden')); const el=$('#'+id); if(el)el.classList.remove('hidden');}
$('#openTerminal').onclick=()=>open('terminalWindow'); $('#openHelp').onclick=()=>open('helpWindow');
document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>open(b.dataset.open));
document.querySelectorAll('[data-window-action="close"]').forEach(b=>b.onclick=()=>b.closest('.window').classList.add('hidden'));
$('#profileButton').onclick=()=>$('#profileMenu').classList.toggle('hidden'); $('#dockLauncher').onclick=()=>$('#profileMenu').classList.toggle('hidden'); $('#launcher').onclick=()=>$('#profileMenu').classList.toggle('hidden');
function renderHelp(q=''){const rows=help.filter(x=>x.join(' ').toLowerCase().includes(q.toLowerCase())); $('#helpResults').innerHTML=rows.map(x=>`<article class="help-card"><b>${esc(x[1])} <small>${esc(x[0])}:${esc(x[3])}</small></b><span>${esc(x[2])}</span></article>`).join('')||'<p>No indexed help entry.</p>';}
$('#helpSearch').oninput=e=>renderHelp(e.target.value); renderHelp();
$('#terminalForm').onsubmit=e=>{e.preventDefault();const raw=$('#terminalInput').value.trim();if(!raw)return;const out=$('#terminalOut');let lines=out.textContent.split('\n');lines.push(`chimera@aurora:$ ${raw}`);if(raw==='help')lines.push('man | apropos | whatis | info | desktop | clear');else if(raw==='clear')lines=[];else if(raw.startsWith('man ')){const q=raw.slice(4).trim().toLowerCase();const hit=help.find(x=>x[1].toLowerCase()===q||`${x[0]}:${x[1]}`.toLowerCase()===q);lines.push(hit?`${hit[1]} (${hit[3]}) — ${hit[2]}`:'No indexed manual entry.');}else if(raw==='desktop')lines.push('Aurora 3D desktop profiles: Linux + Windows');else lines.push('Use the unified resolver for catalogued commands; arbitrary host execution is disabled in Web UI.');out.textContent=lines.slice(-18).join('\n');$('#terminalInput').value='';out.scrollTop=out.scrollHeight};
fetch('/desktop_profiles.json',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(c=>{profiles=(c.profiles||[]).map(p=>({id:p.id,name:p.name||p.title,platform:p.platform||p.family}));}).catch(()=>{profiles=fallbackProfiles.map(([id,name,platform])=>({id,name,platform}));}).finally(()=>{renderProfiles();const saved=localStorage.getItem('chimera.desktop.profile')||'aurora';const p=profiles.find(x=>x.id===saved)||profiles[0];if(p)setProfile(p.id,p.name);});
setInterval(()=>$('#clock').textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}),1000);
