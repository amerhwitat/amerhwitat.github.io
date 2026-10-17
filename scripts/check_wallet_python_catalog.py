#!/usr/bin/env python3
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=ROOT/"apps/chimera-ii-os/web/wallet-python-catalog.json"
d=json.loads(p.read_text(encoding="utf-8"))
assert d.get("schema")=="aurora-wallet-python-catalog/v1"
files=d.get("files",[]); repos=d.get("repositories",[])
assert "OctavianOS" in {x.get("repo") for x in repos}, "Python catalog must include OctavianOS"
assert d["summary"]["total_python_files"]==len(files)
assert d["summary"]["repositories"]==len(repos)
assert len({(x["repo"],x["path"]) for x in files})==len(files)
assert all(x["path"].lower().endswith(".py") for x in files)
assert all(x.get("role") in {"entrypoint","module","library","test"} for x in files)
assert d["summary"]["runnable_files"]==sum(1 for x in files if x.get("runnable"))
assert all(x["url"].startswith("https://github.com/amerhwitat/") for x in files)
assert all(isinstance(x.get("conversion_plan"),dict) for x in files)
assert all({"target","status","reason"} <= set(x["conversion_plan"]) for x in files)
assert d["summary"]["conversion_plan_counts"] == {target:sum(1 for x in files if x["conversion_plan"]["target"]==target) for target in sorted({x["conversion_plan"]["target"] for x in files})}
assert all(x["conversion_plan"]["status"] in {"keep-as-test","keep-as-tool","needs-capability-adapter","needs-service-parity","needs-dependency-audit","needs-feature-port","needs-domain-parity","needs-dependency-and-parity-audit"} for x in files)

print(f"Python catalog integrity: PASS ({len(files)} files / {len(repos)} repositories)")
