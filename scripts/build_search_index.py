"""Build search-index.json for the portfolio hub.

Walks every .html page in the site root (excluding .git) and emits a compact
full-text index consumed by index.html's "Matching pages" search.
Run from the repo root: python3 scripts/build_search_index.py
"""
import os,re,json,html
GROUPS=[("apps/chimera-ii-os","Chimera II OS"),("apps/cpu4096-simulator","CPU4096 Simulator"),
        ("apps/cpu4096","CPU4096"),("apps/bizx-asset-browser","BizX"),("apps/bizxtreme-3d","BizXtreme"),
        ("apps/thamudic-scanner","Research (nlp)"),("apps/thamudic-epi","Research (nlp)"),
        ("apps/nlp-amiga","Research (nlp)"),("apps/chimera-3d4d","Studio & Tools"),
        ("apps/seo-tool","Studio & Tools"),("apps/aurora-mobile","Studio & Tools"),
        ("apps/agent-research-forge","Studio & Tools"),("apps/chimera-test-suite","More"),
        ("apps/pdf-reader","More"),("apps/chimera-pages","Published pages"),
        ("apps/thamudic-pages","Published pages"),("apps/","Apps"),
        ("docs/web-ui","Documentation"),("docs","Documentation"),("web","Web"),("chimera","Chimera"),("thamudic","Thamudic")]
def group_of(p):
    for pre,name in GROUPS:
        if p.startswith(pre): return name
    return "Portfolio"
def text_of(h):
    h=re.sub(r'(?is)<script.*?</script>',' ',h)
    h=re.sub(r'(?is)<style.*?</style>',' ',h)
    h=re.sub(r'(?is)<head.*?</head>',' ',h)
    h=re.sub(r'(?s)<[^>]+>',' ',h)
    h=html.unescape(h)
    return re.sub(r'\s+',' ',h).strip()
entries=[]
for dp,dn,fn in os.walk('.'):
    dn[:]=[d for d in dn if d not in ('.git', '.vercel', 'node_modules', 'dist', 'build')]
    for f in fn:
        if not f.endswith('.html'): continue
        p=os.path.relpath(os.path.join(dp,f),'.')
        try: raw=open(p,encoding='utf-8',errors='ignore').read()
        except Exception: continue
        m=re.search(r'(?is)<title[^>]*>(.*?)</title>',raw)
        title=html.unescape(re.sub(r'\s+',' ',m.group(1)).strip()) if m else p
        dm=re.search(r'(?is)<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']',raw)
        desc=html.unescape(dm.group(1).strip()) if dm else ""
        body=text_of(raw)
        entries.append({"p":p,"t":title[:160],"g":group_of(p),"d":desc[:200],"x":body[:900]})
# Catalog entries are authored in index.html's JavaScript data, so the HTML crawler
# cannot see them. Add stable virtual search records so deployment regeneration
# preserves the hosted-app and repository inventory search contract.
virtual_entries = [
    {"p":"index.html","t":"Amer Hwitat — Chimera II OS ecosystem hub","g":"Hub",
     "d":"Static hub hero, APPS catalogue, REPOS index, search-index.json full-text page search, five Thamudic / Ancient North Arabian script families, and the Chimera II OS web app collection.",
     "x":"APPS REPOS static hub full-text page search search-index.json ThamudicScan v2.4.1 upload camera five-stage pipeline five script families sample inscriptions field tips export Chimera II OS React Aurora Koronos kernel terminal 154 web files 680 files 3123 files 2.1 GB"},
    {"p":"apps/thamudic-scanner/index.html","t":"ThamudicScan v2.4.1 — Ancient North Arabian Scanner","g":"Thamudic",
     "d":"Scanner feature reference: upload/camera, five-stage pipeline, five script families, sample inscriptions, field tips and export. The abbreviated BuiltWithRocket deployment URL is not verified; this published scanner is the fallback.",
     "x":"ThamudicScan v2.4.1 Thamudic Safaitic Dadanitic Hismaic Taymanitic Ancient North Arabian upload camera OCR five-stage pipeline sample inscriptions field tips export"},
    {"p":"https://chimera-iios-120143.onhercules.app/","t":"Chimera II OS — Hosted Aurora Desktop SPA","g":"Chimera II OS",
     "d":"Hosted React desktop SPA for Aurora, Koronos, kernel and terminal exploration. Web UI availability is not proof of native kernel execution or ISO boot.",
     "x":"chimera-iios-120143.onhercules.app React Chimera II OS Aurora Koronos kernel terminal desktop SPA"},
    {"p":"apps/chimera-ii-os/web/index.html","t":"Chimera II OS Web Apps — 154-file inventory","g":"Chimera II OS",
     "d":"Project-reported inventory of 154 web files covering Aurora desktop, terminal, ISA explorer, emulators, OCR, wallet, installer and related tools. Snapshot count should be regenerated as the repository changes.",
     "x":"ChimeraIIOS web files 154 Aurora desktop terminal ISA explorer emulators OCR wallet installer apps"}
]
for virtual in virtual_entries:
    match = next((i for i, entry in enumerate(entries)
                  if entry["p"] == virtual["p"] and entry["t"] == virtual["t"]), None)
    if match is None:
        entries.append(virtual)
    else:
        entries[match].update(virtual)
entries.sort(key=lambda e:(e["g"],e["p"]))
json.dump({"generated_by":"amerhwitat.github.io hub indexer","pages":entries},open('search-index.json','w',encoding='utf-8'),ensure_ascii=False)
print("indexed pages:",len(entries),"| bytes:",os.path.getsize('search-index.json'))
