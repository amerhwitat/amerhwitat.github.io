import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('./portal-backend.js',import.meta.url),'utf8');
const store=new Map(),requests=[];
const localStorage={
  getItem:key=>store.get(key)??null,
  setItem:(key,value)=>store.set(key,String(value)),
  removeItem:key=>store.delete(key)
};
const fetch=async(url,options={})=>{
  requests.push({url,options});
  let data;
  if(url.endsWith('/health'))data={ok:true,mode:'safe-commands-only'};
  else if(url.endsWith('/api/capabilities'))data={ok:true,unsafe_shell:false,workspace:'/tmp/ChimeraWebTerminal'};
  else data={ok:true,output:'bridge output',exit_code:0,mode:'safe',session:'session-1'};
  return {ok:true,status:200,headers:{get:()=> 'application/json'},json:async()=>data,text:async()=>JSON.stringify(data)};
};
const window={};
vm.runInNewContext(source,{
  window,document:{querySelector:()=>null},localStorage,
  location:{hostname:'amerhwitat.github.io',href:''},
  crypto:{randomUUID:()=> 'session-1'},fetch,URLSearchParams,Math,Date
});
const api=window.ChimeraPortal;
api.config.base='http://127.0.0.1:8767';
api.config.token='test-token';
const capabilities=await api.connect();
assert.equal(capabilities.unsafe_shell,false);
const result=await api.command('pwd','Linux','bash');
assert.equal(result.output,'bridge output');
const request=requests.at(-1);
assert.equal(request.options.headers.authorization,'Bearer test-token');
assert.equal(JSON.parse(request.options.body).session,'session-1');
assert.equal(api.config.session,'session-1');
api.config.token='';
const denied=await api.command('id','Linux','bash');
assert.equal(denied.ok,false);
assert.equal(denied.mode,'local-bridge-required');
console.log('Aurora local terminal bridge client tests: PASS');
