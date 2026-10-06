#!/usr/bin/env python3
"""Sync the portal ancient-language registry from the first-party NLP repository."""
import json,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
url="https://raw.githubusercontent.com/amerhwitat/nlp/main/ThamudicEpiPlatform/data/schemas/language_registry.json"
data=json.loads(urllib.request.urlopen(url,timeout=20).read().decode("utf-8"))
# Keep the portal's local registry stable and evidence-bound; only source/target catalogs are synced.
out=ROOT/"apps/chimera-ii-os/web/ancient-language-registry.json"
current=json.loads(out.read_text(encoding="utf-8")) if out.exists() else {}
existing={x["id"]:x for x in current.get("sources",[])}
for item in data.get("source_languages",[]):
    existing.setdefault(item["id"],{"id":item["id"],"name":item["name"],"ranges":[]})
current["sources"]=list(existing.values())
targets=[]
for code in data.get("target_languages",{}).get("defaults",[])+data.get("target_languages",{}).get("examples",[]):
    if code not in [x["code"] for x in targets]: targets.append({"code":code,"name":code})
# Preserve the descriptive names already committed.
name_by={x["code"]:x["name"] for x in current.get("targets",[])}
current["targets"]=[{"code":c,"name":name_by.get(c,c)} for c in targets]
current["source"]="amerhwitat/nlp"
current["synced_from"]=url
out.write_text(json.dumps(current,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Synced",len(current["sources"]),"source languages and",len(current["targets"]),"targets.")
