import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const apps = [
  { icon: "📁", name: "Files", description: "File manager integration awaits native userspace." },
  { icon: "🌐", name: "Browser", description: "Browser app launching is a native integration milestone." },
  { icon: "⌘", name: "Terminal", description: "The shell runtime is not connected to this web preview." },
  { icon: "⚙️", name: "Settings", description: "System settings require the installed service APIs." },
  { icon: "🧩", name: "App Library", description: "Applications appear when signed app manifests are imported." },
  { icon: "🌊", name: "Marine", description: "Marine Desktop is a separate desktop session, not a skin toggle." },
  { icon: "✨", name: "Aurora", description: "Aurora Wayland Glass is the primary desktop session target." },
  { icon: "📊", name: "System Monitor", description: "Live telemetry requires native service endpoints." },
];

function App() {
  const [active, setActive] = useState("Overview");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("Browser preview only · Native kernel and services are not bundled.");
  const [mobileMenu, setMobileMenu] = useState(false);
  const visibleApps = useMemo(() => apps.filter(a => (a.name + " " + a.description).toLowerCase().includes(query.toLowerCase())), [query]);
  const openApp = (app) => { setActive(app.name); setNotice(app.description); setMobileMenu(false); };
  return <div className="shell">
    <header className="menubar"><button className="brand" onClick={() => {setActive("Overview");setNotice("Welcome to the OctavianOS React preview.");}}>◈ OCTAVIANOS</button><nav className={mobileMenu ? "menu-links open" : "menu-links"}>{["Overview","Applications","Architecture","Mobile"].map(item=><button key={item} className={active===item?"selected":""} onClick={()=>{setActive(item);setMobileMenu(false);}}>{item}</button>)}</nav><button className="menu-toggle" onClick={()=>setMobileMenu(!mobileMenu)} aria-label="Toggle menu">☰</button><span className="clock">{new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span></header>
    <main className="workspace">
      <aside className="desktop-icons">{[{icon:"📁",name:"Files"},{icon:"🧩",name:"Applications"},{icon:"🌌",name:"Artwork"},{icon:"📱",name:"Mobile"}].map(item=><button key={item.name} className="desktop-icon" onClick={()=>{ if(item.name==="Applications") setActive("Applications"); else if(item.name==="Mobile") setActive("Mobile"); else if(item.name==="Artwork") { setActive("Overview"); setNotice("Artwork and wallpaper preview selected."); } else { const target=apps.find(a=>a.name===item.name); if(target) openApp(target); else setNotice(item.name+" preview selected."); } }}><span>{item.icon}</span>{item.name}</button>)}</aside>
      <section className="panel">
        <div className="panel-top"><span className="dot red"/><span className="dot yellow"/><span className="dot green"/><span className="panel-title">{active} · OctavianOS</span></div>
        <div className="panel-content">
          <p className="eyebrow">OCEANIC COMPUTING · RESEARCH PREVIEW</p>
          <h1>{active === "Mobile" ? "OctavianOS, in your hand." : active === "Architecture" ? "From boot chain to desktop." : active === "Applications" ? "Your application space." : "A new ocean for computing."}</h1>
          <p className="intro">{active === "Mobile" ? "The React Native companion UI shares the OctavianOS visual language. It does not claim to boot the ARM64 mobile OS." : "A responsive React interface for exploring the OctavianOS experience. This is the presentation layer—not a substitute for Koronos, the microkernel, or native services."}</p>
          {active === "Architecture" ? <div className="flow">{["Spit Fire","Jasper / GRUB 2","Koronos ELF","Drivers + scheduler","Live / Installer / Recovery","Aurora or Marine"].map((x,i)=><div className="flow-step" key={x}><b>{String(i+1).padStart(2,"0")}</b>{x}</div>)}</div> : active === "Mobile" ? <div className="mobile-preview"><div className="phone"><div className="phone-notch"/><div className="phone-title">OCTAVIANOS</div><div className="phone-orb">🌊</div><h2>Oceanic computing</h2><p>Mobile companion preview</p><div className="phone-grid">{["Apps","Files","Terminal","Settings"].map(x=><button key={x} onClick={()=>{ if(x==="Apps") { setActive("Applications"); setNotice("Application catalogue opened in the web preview."); } else { const target=apps.find(a=>a.name===x); if(target) openApp(target); else setNotice(x+" preview selected; native service integration remains a separate OS milestone."); } }}>{x}</button>)}</div></div><p>For the React Native app source, see <code>mobile/App.tsx</code> in this project.</p></div> : <><div className="app-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search apps and features…" aria-label="Search applications"/></div><div className="app-grid">{visibleApps.map(app=><button className="app-card" key={app.name} onClick={()=>openApp(app)}><span className="app-icon">{app.icon}</span><strong>{app.name}</strong><small>Open preview</small></button>)}</div></>}
          <div className="notice" role="status" aria-live="polite">{notice}</div>
        </div>
      </section>
    </main>
    <footer className="dock">{apps.slice(0,6).map(app=><button key={app.name} aria-label={app.name} title={app.name} onClick={()=>openApp(app)}>{app.icon}</button>)}</footer>
    <footer className="legal">OctavianOS preview · Web UI only · <a href="https://github.com/amerhwitat/OctavianOS">OS source</a> · <a href="https://github.com/amerhwitat/OctavianOS/releases">Releases</a> · <a href="/project-updates.html">Build &amp; release status</a></footer>
  </div>;
}
createRoot(document.getElementById("root")).render(<App />);