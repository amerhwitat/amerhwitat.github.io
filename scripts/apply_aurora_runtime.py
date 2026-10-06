#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
needle='<script src="/apps/chimera-ii-os/web/site-learning.js"></script>'
style='<link rel="stylesheet" href="/apps/chimera-ii-os/web/aurora-shared.css">'
for p in ROOT.rglob("*.html"):
    if ".git" in p.parts: continue
    try:s=p.read_text(encoding="utf-8")
    except UnicodeDecodeError: continue
    changed=False
    if "aurora-shared.css" not in s and "</head>" in s:
        s=s.replace("</head>",style+"</head>",1);changed=True
    if "site-learning.js" not in s and "</body>" in s:
        s=s.replace("</body>",needle+"</body>",1);changed=True
    if changed:p.write_text(s,encoding="utf-8")
print("Aurora runtime injection complete.")
