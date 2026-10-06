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
    dn[:]=[d for d in dn if d not in ('.git',)]
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
entries.sort(key=lambda e:(e["g"],e["p"]))
json.dump({"generated_by":"amerhwitat.github.io hub indexer","pages":entries},open('search-index.json','w',encoding='utf-8'),ensure_ascii=False)
print("indexed pages:",len(entries),"| bytes:",os.path.getsize('search-index.json'))
