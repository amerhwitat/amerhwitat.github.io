const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const HOST = process.env.CHIMERA_WEB_HOST || '127.0.0.1';
const PORT = Number(process.env.CHIMERA_WEB_PORT || 3000);
const PY_HOST = process.env.CHIMERA_PY_HOST || '127.0.0.1';
const PY_PORT = Number(process.env.CHIMERA_PY_PORT || 8765);
const ROOT = __dirname;
const ALLOWED_ORIGINS = new Set((process.env.CHIMERA_ALLOWED_ORIGINS || 'https://amerhwitat.github.io,http://localhost:3000').split(',').map(x=>x.trim()).filter(Boolean));
let pythonChild = null;
const LEARNING_FILE = path.resolve(ROOT, '../../data/user-learning.json');
function readLearning(){try{return JSON.parse(fs.readFileSync(LEARNING_FILE,'utf8'))}catch{return {schema:'chimera-user-learning/v1',events:[]}}}
function learning(req,res){if(req.method==='POST' && req.url==='/api/learning/event'){let body='';req.on('data',d=>{if(body.length<10000)body+=d});req.on('end',()=>{try{const event=JSON.parse(body);const doc=readLearning();doc.events.push({schema:'chimera-user-learning/v1',timestamp:new Date().toISOString(),page:String(event.page||'').slice(0,300),element:String(event.element||'').slice(0,160),action:String(event.action||'').slice(0,160)});doc.events=doc.events.slice(-10000);fs.mkdirSync(path.dirname(LEARNING_FILE),{recursive:true});fs.writeFileSync(LEARNING_FILE,JSON.stringify(doc,null,2)+'\n');res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify({ok:true,count:doc.events.length}))}catch(e){res.writeHead(400,{'content-type':'application/json'});res.end(JSON.stringify({ok:false,error:e.message}))}});return true}if(req.method==='GET'&&req.url==='/api/learning/export'){const doc=readLearning();res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(JSON.stringify(doc));return true}return false}


function startPython() {
  if (process.env.CHIMERA_EXTERNAL_PYTHON === '1') return;
  const executable = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  pythonChild = spawn(executable, ['-m', 'chimera_py.main', '--api-host', PY_HOST, '--api-port', String(PY_PORT)], {
    cwd: path.resolve(ROOT, '..'), stdio: 'inherit', env: process.env
  });
  pythonChild.on('exit', (code, signal) => {
    console.log(`[CHIMERA] Python runtime exited code=${code} signal=${signal || ''}`);
  });
}

function cors(req,res){const origin=req.headers.origin;if(origin&&ALLOWED_ORIGINS.has(origin))res.setHeader('access-control-allow-origin',origin);res.setHeader('vary','Origin');res.setHeader('access-control-allow-methods','GET,POST,OPTIONS');res.setHeader('access-control-allow-headers','content-type,accept');}

function proxy(req, res) { cors(req,res); if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
  const options = { host: PY_HOST, port: PY_PORT, path: req.url, method: req.method, headers: req.headers };
  const upstream = http.request(options, response => {
    res.writeHead(response.statusCode || 502, response.headers);
    response.pipe(res);
  });
  upstream.on('error', err => {
    res.writeHead(502, {'content-type':'application/json'});
    res.end(JSON.stringify({ok:false, error:'Python API unavailable', detail:err.message}));
  });
  req.pipe(upstream);
}

function staticFile(req, res) {
  let requestPath = decodeURIComponent(req.url.split('?')[0]);
  if (requestPath === '/') requestPath = '/index.html';
  const safe = path.normalize(requestPath).replace(/^([.][.][/\\])+/, '');
  const file = path.join(ROOT, safe);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(file).toLowerCase();
    const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
    res.writeHead(200, {'content-type': types[ext] || 'application/octet-stream', 'cache-control':'no-cache'});
    res.end(data);
  });
}

startPython();
const server = http.createServer((req, res) => { cors(req,res); if(req.method==='OPTIONS'){res.writeHead(204);return res.end();} if(learning(req,res)) return; if(req.url === '/health'){res.writeHead(200, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'});return res.end(JSON.stringify({ok:true,service:'chimera-web-gateway',mode:'capability-gated',python:`http://${PY_HOST}:${PY_PORT}`}));} return req.url.startsWith('/api/') ? proxy(req,res) : staticFile(req,res); });
server.listen(PORT, HOST, () => console.log(`[AURORA-WEB] http://${HOST}:${PORT} -> Python ${PY_HOST}:${PY_PORT}`));

function shutdown() {
  server.close();
  if (pythonChild) pythonChild.kill('SIGTERM');
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
