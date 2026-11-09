#!/usr/bin/env python3
"""Validate the unified Chimera II OS and OctavianOS desktop gallery."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "desktops/gallery.js"
text = SOURCE.read_text(encoding="utf-8")
ids = re.findall(r'\{id:"([^"]+)"', text)
if len(ids) < 48:
    raise SystemExit(f"desktop gallery is incomplete: expected at least 48 profiles, found {len(ids)}")
if len(ids) != len(set(ids)):
    raise SystemExit("desktop gallery contains duplicate profile IDs")

required = {
    "chimera-aurora", "chimera-marine", "octavian-aurora", "octavian-marine",
    "linux-gnome", "linux-kde", "linux-xfce", "linux-ukui", "linux-trinity",
    "linux-sway", "linux-i3", "linux-hyprland", "linux-openbox", "linux-icewm",
    "linux-fluxbox", "linux-posix", "windows-modern", "macos-inspired",
    "octavian-aurora-wayland", "retro-desktop",
}
missing = sorted(required - set(ids))
if missing:
    raise SystemExit("desktop gallery is missing registered profiles: " + ", ".join(missing))

def local_target(value: str) -> Path:
    relative = value.lstrip("/")
    target = ROOT / relative
    if target.is_dir():
        target = target / "index.html"
    return target

art = re.findall(r'art:"([^"]+)"', text)
previews = re.findall(r'preview:"([^"]+)"', text)
missing_art = sorted({value for value in art if not local_target(value).is_file()})
missing_previews = sorted({value for value in previews if not local_target(value).is_file()})
if missing_art:
    raise SystemExit("desktop gallery artwork is missing: " + ", ".join(missing_art))
if missing_previews:
    raise SystemExit("desktop gallery preview route is missing: " + ", ".join(missing_previews))

chimera = len(re.findall(r'\{id:"[^"]+",os:"chimera"', text))
octavian = len(re.findall(r'\{id:"[^"]+",os:"octavian"', text))
print(f"PASS: {len(ids)} desktop profiles ({chimera} Chimera II OS, {octavian} OctavianOS); all local artwork and preview routes resolve.")
