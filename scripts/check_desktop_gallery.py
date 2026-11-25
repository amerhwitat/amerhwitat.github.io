#!/usr/bin/env python3
"""Validate the three-edition desktop gallery, artwork, routes and host boundary."""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "desktops/gallery.js"
PAGE = ROOT / "desktops/index.html"
text = SOURCE.read_text(encoding="utf-8")
html = PAGE.read_text(encoding="utf-8")
hub = (ROOT / "apps/os-desktop-hub/index.html").read_text(encoding="utf-8")
ecosystem = (ROOT / "desktop-ecosystem.html").read_text(encoding="utf-8")
showcase = (ROOT / "apps/desktop-showcase/index.html").read_text(encoding="utf-8")
dashboard = (ROOT / "apps/chimera-ii-os/web/release-closure-dashboard.html").read_text(encoding="utf-8")
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
    "chimera-aurora-reference-preview", "octavian-marine-reference-preview",
    "linuxkoronos-reference-preview",
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
if min(counts.values()) < 1:
    raise SystemExit(f"unexpected project edition profile counts: {counts}")
if 'data-os="linuxkoronos"' not in html or "Three project editions" not in html:
    raise SystemExit("desktop gallery is missing the LinuxKoronos host filter or three-edition heading")
if "Host-managed desktop" not in html or "existing Linux desktop session remains in control" not in html:
    raise SystemExit("LinuxKoronos host boundary must be explicit; do not claim a bundled shell")
if "LinuxKoronos · Hosted runtime" not in hub or "LinuxKoronos Host Runtime" not in ecosystem:
    raise SystemExit("secondary desktop launchpads are missing the LinuxKoronos host-runtime boundary")
if "id:'linuxkoronos'" not in showcase or "Hosted runtime adapter" not in showcase:
    raise SystemExit("interactive desktop showcase is missing its LinuxKoronos host profile")
disposition = (ROOT / "apps/chimera-ii-os/web/final-release-disposition.html").read_text(encoding="utf-8")
if "Reference-led desktop concept artwork" not in html:
    raise SystemExit("desktop gallery is missing the reference-led concept artwork section")
remaining_rows = (
    "Real architecture context switching", "Outstanding",
    "Timer-driven preemption", "Outstanding",
    "AP startup and SMP", "Outstanding",
    "Resident, kernel-owned PID 1", "Outstanding",
    "Persistent VFS and storage", "Outstanding",
    "Installer/recovery transactions", "Outstanding",
    "Windows-compatible runtime", "Outstanding",
    "Full tested source parity", "Outstanding",
    "Six-case production acceptance", "Not passed",
    "Production-certified Chimera ISO", "Not published",
)
if "Remaining implementation and release gates" not in dashboard or any(row not in dashboard for row in remaining_rows):
    raise SystemExit("release dashboard is missing the supplied remaining implementation and release gates")
if "Repository status updates are published" not in dashboard or "Successful hosted CI and firmware probes are not substitutes" not in dashboard:
    raise SystemExit("remaining-gates status is missing the final disposition")
if "PRODUCTION RELEASE BLOCKED" not in disposition or "Remaining implementation and release gates" not in disposition:
    raise SystemExit("authoritative final disposition must remain blocked and linked to the remaining gates")
if "Final execution ledger" in dashboard or "Final execution ledger" in disposition:
    raise SystemExit("stale final execution ledger must not remain")
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
for asset in (
    "chimera-aurora-glass-desktop.jpg",
    "octavian-marine-desktop.jpg",
    "linux-koronos-desktop.jpg",
    "SOURCES.md",
):
    if not (ROOT / "assets/desktop-reference-previews" / asset).is_file():
        raise SystemExit(f"reference-led desktop preview asset is missing: {asset}")
for needle, label in (
    ("Reference-led concept artwork", "interactive desktop showcase"),
    ("Reference-led desktop artwork", "desktop hub"),
    ("Reference-led desktop concept artwork", "desktop gallery"),
    ("Reference-led desktop previews are concept artwork", "desktop ecosystem page"),
):
    if needle not in (ROOT / "apps/desktop-showcase/index.html").read_text(encoding="utf-8") and label == "interactive desktop showcase":
        raise SystemExit(f"{label} is missing the reference artwork section")
    if needle not in (ROOT / "apps/os-desktop-hub/index.html").read_text(encoding="utf-8") and label == "desktop hub":
        raise SystemExit(f"{label} is missing the reference artwork section")
    if needle not in html and label == "desktop gallery":
        raise SystemExit(f"{label} is missing the reference artwork section")
    if needle not in (ROOT / "desktop-ecosystem.html").read_text(encoding="utf-8") and label == "desktop ecosystem page":
        raise SystemExit(f"{label} is missing the reference artwork note")
if len(re.findall(r'class="desktop-card(?:\s+[^\"]*)?"', html)) != 7:
    raise SystemExit("expected six visual desktop showcases and one LinuxKoronos host adapter card")
bg_manifest_path = ROOT / "assets/desktop-reference-previews/BACKGROUNDS.json"
if not bg_manifest_path.is_file():
    raise SystemExit("desktop background manifest is missing")
bg_manifest = json.loads(bg_manifest_path.read_text(encoding="utf-8"))
if bg_manifest.get("asset_count") != 19 or len(bg_manifest.get("images", [])) != 19:
    raise SystemExit("desktop background manifest must contain all 19 supplied images")
for record in bg_manifest["images"]:
    target = ROOT / record["asset"].lstrip("/")
    if not target.is_file():
        raise SystemExit(f"supplied background asset is missing: {record['asset']}")
    if len(record.get("source_sha256", "")) != 64:
        raise SystemExit(f"supplied background SHA-256 is missing: {record['id']}")
for rel, needle in (
    ("desktops/background-references.html", "19 supplied images"),
    ("desktops/index.html", "background-references.html"),
    ("apps/os-desktop-hub/index.html", "background-references.html"),
    ("apps/desktop-showcase/index.html", "background-references.html"),
    ("desktop-ecosystem.html", "background-references.html"),
    ("apps/chimera-ii-os/web/release-closure-dashboard.html", "background-references.html"),
    ("apps/chimera-ii-os/web/final-release-disposition.html", "background-references.html"),
):
    if needle not in (ROOT / rel).read_text(encoding="utf-8"):
        raise SystemExit(f"three-edition background reference link is missing: {rel}")
if "PRODUCTION RELEASE BLOCKED" not in disposition:
    raise SystemExit("authoritative release disposition changed while adding background references")
icon_assets = (
    "assets/desktop-icons/ICON_MAP.json",
    "assets/desktop-icons/SOURCES.md",
    "assets/desktop-icons/default-desktop-icon-a.png",
    "assets/desktop-icons/default-desktop-icon-b.png",
    "assets/desktop-icons/sources/e96b2253-fb69-4f33-a675-aa245fa5a9f5.png",
    "assets/desktop-icons/sources/4308a40a-64aa-403e-8eba-b586d1e911bf.png",
)
for rel_asset in icon_assets:
    if not (ROOT / rel_asset).is_file():
        raise SystemExit(f"sliced desktop icon asset is missing: {rel_asset}")
icon_sources = (ROOT / "assets/desktop-icons/SOURCES.md").read_text(encoding="utf-8")
for digest in (
    "28d0203ccdbbcfddb52c5272d96a5ecad124cbe81f060edd7af2ab97e296f415",
    "a223d2e34fb83e2edc6f3e39421d334d0a115d9a72f8b370ff0b7eb6b4429c50",
):
    if digest not in icon_sources:
        raise SystemExit("sliced icon provenance is missing an original SHA-256")
if "not runtime evidence" not in icon_sources or "96 × 96" not in icon_sources:
    raise SystemExit("sliced icon provenance must state the concept-only boundary and crop geometry")
icon_map = json.loads((ROOT / "assets/desktop-icons/ICON_MAP.json").read_text(encoding="utf-8"))
if not icon_map.get("concept_only"):
    raise SystemExit("sliced icon map must remain concept-only")
catalog_manifest = json.loads((ROOT / "assets/icons/chimera-octavian/manifest.json").read_text(encoding="utf-8"))
expected_icons = len(catalog_manifest["apps"])
if icon_map.get("mapped_icon_count") != expected_icons or len(icon_map.get("icons", {})) != expected_icons:
    raise SystemExit(f"sliced icon map must cover all {expected_icons} catalog icons")
for record in icon_map["icons"].values():
    asset = record.get("asset", "")
    if not asset.startswith("/assets/desktop-icons/slices/"):
        raise SystemExit(f"sliced icon map contains a non-slice asset: {asset}")
    if not (ROOT / asset.lstrip("/")).is_file():
        raise SystemExit(f"sliced icon asset is missing: {asset}")
catalog_svg = (ROOT / "assets/icons/chimera-octavian/catalog.svg").read_text(encoding="utf-8")
slice_refs = catalog_svg.count('<image href="/assets/desktop-icons/slices/')
if slice_refs < expected_icons:
    raise SystemExit(f"catalog sprite has only {slice_refs} sliced icon references; expected {expected_icons}")
if "default-desktop-icon-a.png" in catalog_svg or "default-desktop-icon-b.png" in catalog_svg:
    raise SystemExit("catalog sprite must use sliced cells, not representative full-sheet aliases")
icon_usage = (
    "desktops/gallery.js",
    "desktops/index.html",
    "apps/chimera-ii-os/web/desktop_experiences.html",
    "apps/chimera-ii-os/web/desktop_experiences.css",
    "desktops/freewin11.html",
    "desktops/freexp.html",
    "apps/chimera-ii-os/web/release-closure-dashboard.html",
    "apps/chimera-ii-os/web/final-release-disposition.html",
)
for rel_usage in icon_usage:
    usage_text = (ROOT / rel_usage).read_text(encoding="utf-8")
    if "/assets/desktop-icons/slices/" not in usage_text:
        raise SystemExit(f"sliced icons are not used in {rel_usage}")
    if "Attached concept desktop icon" in usage_text or "Concept A" in usage_text or "Concept B" in usage_text:
        raise SystemExit(f"stale concept placeholder remains in {rel_usage}")
if "PRODUCTION RELEASE BLOCKED" not in disposition or "Not published" not in dashboard:
    raise SystemExit("authoritative blocked disposition changed while slicing attached icons")
print(
    f"PASS: {len(ids)} profiles ({counts['chimera']} Chimera II OS, "
    f"{counts['octavian']} OctavianOS, {counts['linuxkoronos']} LinuxKoronos host); "
    "all local artwork and preview routes resolve."
)
