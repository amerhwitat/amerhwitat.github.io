#!/usr/bin/env python3
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/"apps/chimera-ii-os/web/wallet-python-catalog.json"
d=json.loads(p.read_text(encoding="utf-8"))
assert d.get("schema")=="aurora-wallet-python-catalog/v1"
files=d.get("files",[]); repos=d.get("repositories",[])
assert d["summary"]["total_python_files"]==len(files)
assert d["summary"]["repositories"]==len(repos)
assert len({(x["repo"],x["path"]) for x in files})==len(files)
assert all(x["path"].lower().endswith(".py") for x in files)
assert all(x["url"].startswith("https://github.com/amerhwitat/") for x in files)
print(f"Python catalog integrity: PASS ({len(files)} files / {len(repos)} repositories)")
