#!/usr/bin/env python3
"""Validate the three-edition desktop gallery, artwork, routes and host boundary."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "desktops/gallery.js"
PAGE = ROOT / "desktops/index.html"
text = SOURCE.read_text(encoding="utf-8")
html = PAGE.read_text(encoding="utf-8")
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
    "octavian-aurora-wayland", "retro-desktop", "linuxkoronos-host-desktop",
}
missing = sorted(required - set(ids))
if missing:
    raise SystemExit("desktop gallery is missing registered profiles: " + ", ".join(missing))

def local_target(value: str) -> Path:
    value = value.split("#", 1)[0].split("?", 1)[0]
    target = ROOT / value.lstrip("/")
    return target / "index.html" if target.is_dir() else target

art = re.findall(r'art:"([^"]+)"', text)
previews = re.findall(r'preview:"([^"]+)"', text)
missing_art = sorted({value for value in art if not local_target(value).is_file()})
missing_previews = sorted({value for value in previews if not local_target(value).is_file()})
if missing_art:
    raise SystemExit("desktop gallery artwork is missing: " + ", ".join(missing_art))
if missing_previews:
    raise SystemExit("desktop gallery preview route is missing: " + ", ".join(missing_previews))

counts = {
    key: len(re.findall(r'\{id:"[^"]+",os:"' + key + r'"', text))
    for key in ("chimera", "octavian", "linuxkoronos")
}
if counts["chimera"] < 1 or counts["octavian"] < 1 or counts["linuxkoronos"] != 1:
    raise SystemExit(f"unexpected project edition profile counts: {counts}")
if 'data-os="linuxkoronos"' not in html or "Three project editions" not in html:
    raise SystemExit("desktop gallery is missing the LinuxKoronos host filter or three-edition heading")
if "Host-managed desktop" not in html or "Linux continues to own" not in html:
    raise SystemExit("LinuxKoronos host boundary must be explicit; do not claim a bundled shell")
for asset in (
    "aurora-glass-3840x2160.svg",
    "marine-blue-3840x2160.svg",
    "freexp-hills-3840x2160.svg",
    "freewin11-fluent-3840x2160.svg",
    "octavian-octopus-aurora.svg",
    "marine-desktop.svg",
):
    if asset not in html:
        raise SystemExit(f"artwork-led desktop showcase is missing {asset}")
if html.count('class="desktop-card') != 7:
    raise SystemExit("expected six visual desktop showcases and one LinuxKoronos host adapter card")
print(
    f"PASS: {len(ids)} profiles ({counts['chimera']} Chimera II OS, "
    f"{counts['octavian']} OctavianOS, {counts['linuxkoronos']} LinuxKoronos host); "
    "all local artwork and preview routes resolve."
)
