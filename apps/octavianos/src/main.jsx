import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const apps = [
  { icon: "📁", name: "Files", description: "Browse the hosted artifact and file library.", href: "https://amerhwitat.github.io/apps/chimera-ii-os/web/artifact-library.html" },
  { icon: "🌐", name: "Browser", description: "Explore hosted apps and repository web entry points.", href: "https://amerhwitat.github.io/apps/repository-app-explorer/" },
  { icon: "⌘", name: "Terminal", description: "Open the hosted Aurora terminal interface.", href: "https://amerhwitat.github.io/apps/chimera-ii-os/web/aurora_terminal.html" },
  { icon: "⚙️", name: "Settings", description: "Open the hosted system control center.", href: "https://amerhwitat.github.io/apps/chimera-ii-os/web/system_control_center.html" },
  { icon: "🧩", name: "App Library", description: "Browse the portfolio app catalog.", href: "https://amerhwitat.github.io/apps/repository-app-explorer/" },
  { icon: "🌊", name: "Marine", description: "Open the Marine desktop web preview.", href: "https://amerhwitat.github.io/apps/octavianos/marine/index.html" },
  { icon: "✨", name: "Aurora", description: "Open the Aurora Wayland Glass desktop web preview.", href: "https://amerhwitat.github.io/apps/octavianos/aurora/index.html" },
  { icon: "📊", name: "System Monitor", description: "Open the hosted system health dashboard.", href: "https://amerhwitat.github.io/apps/chimera-ii-os/web/health.html" },
];

function App() {
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("Browser preview only · Native kernel and services are not bundled.");
  const [mobileMenu, setMobileMenu] = useState(false);
  const visibleApps = useMemo(() => apps.filter(a => (a.name + " " + a.description).toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="shell">
    <header className="menubar"><button className="brand" onClick={() => {setActive("Overview");setNotice("Welcome to the OctavianOS React preview.");}}>◈ OCTAVIANOS</button><nav className={mobileMenu ? "menu-links open" : "menu-links"}>{["Overview","Applications","Architecture","Mobile"].map(item=><button key={item} className={active===item?"selected":""} onClick={()=>{setActive(item);setMobileMenu(false);}}>{item}</button>)}</nav><button className="menu-toggle" onClick={()=>setMobileMenu(!mobileMenu)} aria-label="Toggle menu">☰</button><span className="clock">{new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span></header>
    <main className="workspace">
      <aside className="desktop-icons">{[{icon:"📁",name:"Files",href:apps.find(a=>a.name==="Files").href},{icon:"🧩",name:"Applications",href:"https://amerhwitat.github.io/apps/repository-app-explorer/"},{icon:"🌌",name:"Artwork",href:"https://amerhwitat.github.io/apps/aurora-glass-desktop/index.html"},{icon:"📱",name:"Mobile",href:"https://amerhwitat.github.io/apps/aurora-mobile/index.html"}].map(item=><a key={item.name} className="desktop-icon" href={item.href}><span>{item.icon}</span>{item.name}</a>)}</aside>
      <section className="panel">
        <div className="panel-top"><span className="dot red"/><span className="dot yellow"/><span className="dot green"/><span className="panel-title">{active} · OctavianOS</span></div>
        <div className="panel-content">
          <p className="eyebrow">OCEANIC COMPUTING · RESEARCH PREVIEW</p>
          <h1>{active === "Mobile" ? "OctavianOS, in your hand." : active === "Architecture" ? "From boot chain to desktop." : active === "Applications" ? "Your application space." : "A new ocean for computing."}</h1>
          <p className="intro">{active === "Mobile" ? "The React Native companion UI shares the OctavianOS visual language. It does not claim to boot the ARM64 mobile OS." : "A responsive React interface for exploring the OctavianOS experience. This is the presentation layer—not a substitute for Koronos, the microkernel, or native services."}</p>
          {active === "Architecture" ? <div className="flow">{["Spit Fire","Jasper / GRUB 2","Koronos ELF","Drivers + scheduler","Live / Installer / Recovery","Aurora or Marine"].map((x,i)=><div className="flow-step" key={x}><b>{String(i+1).padStart(2,"0")}</b>{x}</div>)}</div> : active === "Mobile" ? <div className="mobile-preview"><div className="phone"><div className="phone-notch"/><div className="phone-title">OCTAVIANOS</div><div className="phone-orb">🌊</div><h2>Oceanic computing</h2><p>Mobile companion preview</p><div className="phone-grid">{[{name:"Apps",href:"https://amerhwitat.github.io/apps/repository-app-explorer/"},{name:"Files",href:apps.find(a=>a.name==="Files").href},{name:"Terminal",href:apps.find(a=>a.name==="Terminal").href},{name:"Settings",href:apps.find(a=>a.name==="Settings").href}].map(item=><a key={item.name} href={item.href}>{item.name}</a>)}</div></div><p>For the React Native app source, see <code>mobile/App.tsx</code> in this project.</p></div> : <><div className="app-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search apps and features…" aria-label="Search applications"/></div><div className="app-grid">{visibleApps.map(app=><a className="app-card" key={app.name} href={app.href}><span className="app-icon">{app.icon}</span><strong>{app.name}</strong><small>Open implementation</small></a>)}</div></>}
          <div className="notice" role="status" aria-live="polite">{notice}</div>
        </div>
      </section>
    </main>
    <footer className="dock">{apps.slice(0,6).map(app=><a key={app.name} aria-label={app.name} title={app.name} href={app.href}>{app.icon}</a>)}</footer>
    <footer className="legal">OctavianOS preview · Web UI only · <a href="https://github.com/amerhwitat/OctavianOS">OS source</a> · <a href="https://github.com/amerhwitat/OctavianOS/releases">Releases</a> · <a href="/project-updates.html">Build &amp; release status</a></footer>
  </div>;
}
createRoot(document.getElementById("root")).render(<App />);