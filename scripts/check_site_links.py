#!/usr/bin/env python3
import re,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
files=[p for p in ROOT.rglob("*") if p.is_file() and p.suffix.lower() in {".html",".js",".css",".json"} and ".git" not in p.parts]
repo_files={p.relative_to(ROOT).as_posix() for p in files}
errors=[]; checked=0
PAT=re.compile(r'''(?<![\w-])(?:href|src|action)\s*=\s*["']([^"']+)["']''',re.I)
def check(base,raw):
    global checked
    raw=raw.strip()
    if not raw or raw.startswith(("#","${","javascript:","mailto:","tel:","data:","blob:","http://","https://","//","fs-uae:","chimera:")) or "${" in raw or raw.startswith(("`","+")): return
    raw=raw.split("#",1)[0].split("?",1)[0]
    if not raw:return
    target=(base.parent/raw).resolve()
    try: rel=target.relative_to(ROOT.resolve()).as_posix()
    except ValueError: return
    checked+=1
    if "/" not in rel and "." not in rel: return
    if target.is_file() or (target.is_dir() and (target/"index.html").is_file()) or (target/"index.html").is_file(): return
        errors.append(f"{base.relative_to(ROOT)} -> {raw} -> missing {rel}")
for p in files:
    if p.name=="search-index.json": continue
    try:s=p.read_text(encoding="utf-8",errors="ignore")
    except:continue
    for m in PAT.finditer(s):check(p,m.group(1))
    for m in re.finditer(r'''location\.(?:href|assign|replace)\s*=\s*["']([^"']+)["']''',s,re.I):check(p,m.group(1))
print(f"Checked {checked} local links.")
if errors:
    print("\n".join(errors[:200])); print(f"FAILED: {len(errors)} missing local links."); sys.exit(1)
print("PASS: no missing local href/src/action targets detected.")
