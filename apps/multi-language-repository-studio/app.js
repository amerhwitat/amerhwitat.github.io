(function(){
"use strict";
const repos=[
{name:"general",branch:"master",purpose:"General code and experiments"},
{name:"BizX",branch:"main",purpose:"Business tools and assets"},
{name:"BizXtreme",branch:"main",purpose:"Business platform and 3D interfaces"},
{name:"test",branch:"main",purpose:"Tests and experiments"},
{name:"eth-key-check",branch:"main",purpose:"Ethereum key checking utility"},
{name:"bruteforce",branch:"main",purpose:"Brute-force research and utilities"},
{name:"keygen",branch:"main",purpose:"Key generation utilities"},
{name:"CPU4096",branch:"main",purpose:"CPU4096 architecture research"},
{name:"PDFreaderPY",branch:"main",purpose:"Python PDF reader"},
{name:"CPU4096Simulator",branch:"main",purpose:"CPU4096 simulator"},
{name:"nlp",branch:"main",purpose:"NLP and ancient-language research"},
{name:"ChimeraIIOS",branch:"main",purpose:"Chimera II OS kernel and userland"},
{name:"amerhwitat.github.io",branch:"main",purpose:"Portfolio and published browser apps"},
{name:"OctavianOS",branch:"main",purpose:"OctavianOS desktop and OS research"}
];
const langDefs=[
["JavaScript","js","javascript", "console.log('Hello from the sandboxed JavaScript runner');"],
["TypeScript","ts","typescript","// TypeScript requires a TypeScript compiler; this editor does not silently treat it as JavaScript.\nconst greeting: string = 'Hello, TypeScript';\nconsole.log(greeting);"],
["HTML","html","html","<!doctype html>\n<html><body style=\"font:16px system-ui;padding:24px\"><h1>Hello, browser</h1><p>Edit this HTML and preview it in the isolated frame.</p></body></html>"],
["CSS","css","css","body { font-family: system-ui; padding: 2rem; color: #17324f; }\nh1 { color: #087ea4; }"],
["Python","py","python","# Python sample — requires a Python runtime to execute.\nmessage = 'Hello, Python'\nprint(message)"],
["Java","java","java","public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, Java\");\n  }\n}"],
["C","c","c","#include <stdio.h>\nint main(void) {\n  puts(\"Hello, C\");\n  return 0;\n}"],
["C++","cpp","cpp","#include <iostream>\nint main() {\n  std::cout << \"Hello, C++\\n\";\n}"],
["C#","cs","csharp","using System;\nclass Program {\n  static void Main() => Console.WriteLine(\"Hello, C#\");\n}"],
["Rust","rs","rust","fn main() {\n    println!(\"Hello, Rust\");\n}"],
["Go","go","go","package main\nimport \"fmt\"\nfunc main() { fmt.Println(\"Hello, Go\") }"],
["PHP","php","php","<?php\necho \"Hello, PHP\\n\";\n"],
["Ruby","rb","ruby","puts 'Hello, Ruby'"],
["Kotlin","kt","kotlin","fun main() {\n    println(\"Hello, Kotlin\")\n}"],
["Swift","swift","swift","import Foundation\nprint(\"Hello, Swift\")"],
["SQL","sql","sql","SELECT 'Hello, SQL' AS greeting;"],
["Shell","sh","shell","#!/usr/bin/env sh\nprintf '%s\\n' 'Hello, shell'"],
["PowerShell","ps1","powershell","Write-Output 'Hello, PowerShell'"],
["Assembly","asm","assembly","; Example only — instruction set and assembler syntax vary.\nsection .text\nglobal _start\n_start:\n    ; Replace with platform-specific syscall/exit sequence"],
["JSON","json","json","{\n  \"project\": \"Repository Studio\",\n  \"status\": \"editable sample\"\n}"],
["Lua","lua","lua","print('Hello, Lua')"],
["R","r","r","message <- 'Hello, R'\nprint(message)"],
["Dart","dart","dart","void main() {\n  print('Hello, Dart');\n}"],
["Objective-C","m","objective-c","#import <Foundation/Foundation.h>\nint main(void) {\n  @autoreleasepool { NSLog(@\"Hello, Objective-C\"); }\n  return 0;\n}"],
["Fortran","f90","fortran","program hello\n  print *, 'Hello, Fortran'\nend program hello"],
["Haskell","hs","haskell","main :: IO ()\nmain = putStrLn \"Hello, Haskell\""],
["Julia","jl","julia","println(\"Hello, Julia\")"],
["Perl 5.44.0 (stable; host runtime)","pl","perl","use strict; use warnings;\n# OS runtime build: tools/perl-runtime/ (native Koronos execution is gated).\nprint \"Hello, Perl\\n\";"],
["MATLAB / Octave","m","matlab","disp('Hello, MATLAB / Octave')"],
["Zig","zig","zig","const std = @import(\"std\");\npub fn main() void {\n    std.debug.print(\"Hello, Zig\\n\", .{});\n}"]
];
let selected=repos.find(r=>r.name==="amerhwitat.github.io"), languageStats={}, openedFiles=0;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function repoUrl(r){return "https://github.com/amerhwitat/"+encodeURIComponent(r.name)}
function apiUrl(r,suffix){return "https://api.github.com/repos/amerhwitat/"+encodeURIComponent(r.name)+suffix}
function drawRepos(){
 const q=$("repoFilter").value.toLowerCase().trim(), root=$("repoList");root.innerHTML="";
 repos.filter(r=>(r.name+" "+r.purpose).toLowerCase().includes(q)).forEach(r=>{
  const d=document.createElement("div");d.className="repo"+(selected&&selected.name===r.name?" active":"");
  const b=document.createElement("button");b.type="button";b.innerHTML="<strong>"+esc(r.name)+"</strong><small>"+esc(r.purpose)+"</small>";
  b.addEventListener("click",()=>selectRepo(r));d.appendChild(b);
  const stats=languageStats[r.name];if(stats){const small=document.createElement("small");small.textContent=Object.keys(stats).slice(0,4).join(" · ")||"No language data";d.appendChild(small)}
  root.appendChild(d);
 });
}
async function loadLanguages(r){
 try{
  const res=await fetch(apiUrl(r,"/languages"),{headers:{Accept:"application/vnd.github+json"}});
  if(!res.ok)throw new Error("GitHub API returned "+res.status);
  languageStats[r.name]=await res.json();drawRepos();return languageStats[r.name];
 }catch(e){$("repoStatus").textContent="Some language metadata is unavailable (rate limit or network). Source links remain available.";return null}
}
function renderLangs(stats){
 const grid=$("languageGrid");grid.innerHTML="";
 const entries=Object.entries(stats||{}).sort((a,b)=>b[1]-a[1]);
 $("langCount").textContent=String(new Set(Object.values(languageStats).flatMap(o=>Object.keys(o))).size||"—");
 if(!entries.length){grid.innerHTML='<div class="muted">No language metadata loaded yet. Try Refresh metadata or open source search.</div>';return}
 entries.forEach(([name,bytes])=>{const b=document.createElement("button");b.className="lang";b.type="button";b.innerHTML="<strong>"+esc(name)+"</strong><small>"+(bytes.toLocaleString()+" bytes reported")+"</small>";b.addEventListener("click",()=>setLanguageByName(name));grid.appendChild(b)});
}
async function selectRepo(r){
 selected=r;drawRepos();$("selectedName").textContent=r.name;$("selectedInfo").textContent=r.purpose+" · default branch: "+r.branch;
 $("repoLink").href=repoUrl(r);$("searchSource").href=repoUrl(r)+"/search";
 const stats=languageStats[r.name]||await loadLanguages(r);renderLangs(stats);
 $("filePath").value="README.md";$("sourceStatus").textContent="Enter a repository-relative file path and load it; source text is shown as text, never executed.";
}
async function refreshAll(){
 $("repoStatus").textContent="Fetching language statistics from GitHub…";
 await Promise.all(repos.map(loadLanguages));
 $("repoCount").textContent=String(repos.length);
 const languages=new Set(Object.values(languageStats).flatMap(o=>Object.keys(o)));
 $("langCount").textContent=String(languages.size||"—");
 $("repoStatus").textContent="Metadata loaded for "+Object.keys(languageStats).length+" of "+repos.length+" public repositories.";
 if(selected)renderLangs(languageStats[selected.name]);
 drawRepos();renderAllLanguages(languages);
}
function renderAllLanguages(detected){
 const all=$("allLanguages");all.innerHTML="";
 const names=new Set(langDefs.map(x=>x[0]));
 (detected||[]).forEach(n=>names.add(n));
 [...names].sort().forEach(n=>{const b=document.createElement("button");b.className="lang";b.type="button";b.innerHTML="<strong>"+esc(n)+"</strong><small>"+((detected||new Set()).has(n)?"Reported by GitHub":"Editor sample available")+"</small>";b.addEventListener("click",()=>setLanguageByName(n));all.appendChild(b)});
}
async function openFile(){
 const path=$("filePath").value.trim().replace(/^\/+/,"");
 if(!selected||!path){$("sourceStatus").textContent="Select a repository and enter a source path.";return}
 $("sourceStatus").textContent="Loading "+path+" …";
 try{
  const url="https://raw.githubusercontent.com/amerhwitat/"+encodeURIComponent(selected.name)+"/"+encodeURIComponent(selected.branch)+"/"+path.split("/").map(encodeURIComponent).join("/");
  const res=await fetch(url);if(!res.ok)throw new Error("File unavailable ("+res.status+"). Check the path and default branch.");
  const text=await res.text();openedFiles++;$("fileCount").textContent=String(openedFiles);
  $("code").value=text;$("sourceStatus").textContent="Loaded "+path+" as editable text. No code was executed.";
  const ext=path.split(".").pop().toLowerCase();const match=langDefs.find(x=>x[1]===ext);
  if(match)setLanguageByName(match[0],false);$("fileType").textContent=path;
  $("searchSource").href=repoUrl(selected)+"/search?q="+encodeURIComponent(path.split("/").pop());
 }catch(e){$("sourceStatus").textContent=e.message+" — use Search source on GitHub to find the correct path."}
}
function currentLang(){return langDefs.find(x=>x[0]===$("language").value)||langDefs[0]}
function setLanguageByName(name,replace=true){
 let d=langDefs.find(x=>x[0].toLowerCase()===name.toLowerCase());
 if(!d){d=langDefs.find(x=>x[0]==="JavaScript")}
 $("language").value=d[0];if(replace)$("code").value=d[3];
 $("fileType").textContent="source."+d[1];$("outputType").textContent=d[2];
 $("runStatus").textContent=(["JavaScript","HTML","CSS","JSON"].includes(d[0])?"Browser action available for this sample.":"Editor/sample mode: a matching compiler or runtime is not bundled.");
}
function initLanguagePicker(){
 langDefs.forEach(d=>{const o=document.createElement("option");o.value=d[0];o.textContent=d[0];$("language").appendChild(o)});
 $("language").value="JavaScript";$("code").value=langDefs[0][3];renderAllLanguages(new Set());
}
function run(){
 const d=currentLang(),code=$("code").value,out=$("output");
 $("outputType").textContent=d[2];
 if(d[0]==="JavaScript"){
  const frame=document.createElement("iframe");frame.setAttribute("sandbox","allow-scripts");frame.title="Isolated JavaScript output";
  const policy="<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'\">";
  const safeConsole="<script>const send=(type,args)=>parent.postMessage({repositoryStudio:true,type,args:args.map(v=>{try{return typeof v==='string'?v:JSON.stringify(v)}catch(e){return String(v)}})},'*');console.log=(...a)=>send('log',a);console.error=(...a)=>send('error',a);console.warn=(...a)=>send('warn',a);window.onerror=(m)=>send('error',[m]);<\/script>";
  frame.srcdoc="<!doctype html><meta charset='utf-8'>"+policy+safeConsole+"<script>\n"+code.replace(/<\/script/gi,"<\\/script")+" \n<\/script>";
  out.replaceChildren(frame);$("runStatus").textContent="JavaScript is running in a sandboxed iframe without same-origin access.";
 }else if(d[0]==="HTML"||d[0]==="CSS"){
  const frame=document.createElement("iframe");frame.setAttribute("sandbox","allow-scripts");frame.title="Isolated HTML preview";
  const src=d[0]==="HTML"?code:"<!doctype html><meta charset='utf-8'><style>"+code.replace(/<\/style/gi,"<\\/style")+"</style><body><h2>CSS preview</h2><p>Sample text</p><button>Sample control</button></body>";
  frame.srcdoc=src.replace(/<\/script/gi,"<\\/script");out.replaceChildren(frame);$("runStatus").textContent=d[0]+" rendered in an isolated sandbox. Network and parent-page access are not granted.";
 }else if(d[0]==="JSON"){
  try{const parsed=JSON.parse(code);out.textContent=JSON.stringify(parsed,null,2);$("runStatus").textContent="Valid JSON. Parsed locally."; }
  catch(e){out.textContent=String(e);$("runStatus").textContent="JSON parse failed."}
 }else{
  out.textContent="No "+d[0]+" runtime is bundled in this static site.\n\nThe code remains editable. To run it, use the corresponding compiler/runtime in a reviewed local environment or connect an explicitly configured remote execution provider. Repository code is never submitted to an untrusted service automatically.";
  $("runStatus").textContent="Preview unavailable: no matching runtime configured for "+d[0]+".";
 }
}
window.addEventListener("message",e=>{
 if(!e.data||e.data.repositoryStudio!==true)return;
 const out=$("output");let pre=out.querySelector(".console-log");if(!pre){pre=document.createElement("pre");pre.className="console-log";pre.style.cssText="position:relative;z-index:1;background:#0c1b2c;border:1px solid #29425f;border-radius:7px;padding:8px;white-space:pre-wrap;overflow-wrap:anywhere";out.appendChild(pre)}
 const line=(e.data.type==="error"?"[error] ":e.data.type==="warn"?"[warn] ":"")+((e.data.args||[]).join(" "));pre.textContent+=line+"\n";
});
$("repoFilter").addEventListener("input",drawRepos);
$("refresh").addEventListener("click",refreshAll);
$("openFile").addEventListener("click",openFile);
$("filePath").addEventListener("keydown",e=>{if(e.key==="Enter")openFile()});
$("searchSource").href=repoUrl(selected)+"/search";
$("language").addEventListener("change",()=>setLanguageByName($("language").value));
$("resetCode").addEventListener("click",()=>setLanguageByName($("language").value));
$("runCode").addEventListener("click",run);
initLanguagePicker();drawRepos();selectRepo(selected);refreshAll();
})();
