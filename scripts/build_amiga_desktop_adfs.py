#!/usr/bin/env python3
"""Build four genuine 880 KiB Amiga OFS floppy images with bootable CLI launch menus.

These are Amiga 500 / Kickstart 1.3-oriented boot-menu disks, not ports of the
modern native or browser desktop implementations. They rely on the emulator's
legally obtained Kickstart ROM. Each image is formatted as OFS and receives a
1.x-compatible Amiga boot block using amitools/xdftool.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "downloads" / "amiga"
ADF_BYTES = 901_120
PROFILES = [
    {
        "file": "chimera-aurora.adf",
        "volume": "CHM_AURORA",
        "title": "CHIMERAIIOS / AURORA",
        "subtitle": "Glass research desktop boot menu",
        "color": "CYAN / DEEP BLUE",
        "commands": ["TYPE README.TXT", "TYPE S/ABOUT.TXT", "DIR", "INFO"],
    },
    {
        "file": "chimera-marine.adf",
        "volume": "CHM_MARINE",
        "title": "CHIMERAIIOS / MARINE",
        "subtitle": "Productivity desktop boot menu",
        "color": "OCEAN BLUE / SILVER",
        "commands": ["TYPE README.TXT", "TYPE S/ABOUT.TXT", "DIR", "INFO"],
    },
    {
        "file": "octavian-aurora.adf",
        "volume": "OCT_AURORA",
        "title": "OCTAVIANOS / AURORA",
        "subtitle": "Creative glass desktop boot menu",
        "color": "VIOLET / AURORA",
        "commands": ["TYPE README.TXT", "TYPE S/ABOUT.TXT", "DIR", "INFO"],
    },
    {
        "file": "octavian-marine.adf",
        "volume": "OCT_MARINE",
        "title": "OCTAVIANOS / MARINE",
        "subtitle": "Windowed productivity boot menu",
        "color": "NAVY / AQUA",
        "commands": ["TYPE README.TXT", "TYPE S/ABOUT.TXT", "DIR", "INFO"],
    },
]


def run(*args: str) -> str:
    result = subprocess.run(
        ["xdftool", *map(str, args)],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        check=True,
    )
    return result.stdout


def write_text(path: Path, value: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(value, encoding="ascii", newline="\n")


def main() -> None:
    if shutil.which("xdftool") is None:
        raise SystemExit("xdftool is required; install the open-source amitools package")
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {
        "schema": "chimera-amiga-desktop-floppies/v1",
        "target": "Amiga 500-class 68000, Kickstart 1.3-compatible boot block",
        "format": "ADF, 3.5-inch DD, 80 tracks, 2 heads, 11 sectors, OFS DOS0",
        "bytes_per_disk": ADF_BYTES,
        "scope": "Bootable text-mode desktop launch menus; not full modern GUI desktop ports",
        "rom_notice": "Kickstart ROM is not included. Use a ROM obtained under a valid license.",
        "disks": [],
    }
    for profile in PROFILES:
        image = OUT / profile["file"]
        startup = OUT / (profile["file"] + ".startup")
        about = OUT / (profile["file"] + ".about")
        readme = OUT / (profile["file"] + ".readme")
        startup_text = "\n".join([
            "Echo \"\"",
            "Echo \"==============================================\"",
            f"Echo \"{profile['title']}\"",
            "Echo \"==============================================\"",
            f"Echo \"{profile['subtitle']}\"",
            f"Echo \"Palette: {profile['color']}\"",
            "Echo \"Amiga 500 / Kickstart 1.3 boot-menu edition\"",
            "Echo \"\"",
            "Echo \"DESKTOP MENU\"",
            "Echo \"  1. Read the desktop guide: TYPE README.TXT\"",
            "Echo \"  2. Read profile details: TYPE S/ABOUT.TXT\"",
            "Echo \"  3. List disk contents: DIR\"",
            "Echo \"  4. Show disk usage: INFO\"",
            "Echo \"\"",
            "Echo \"This is a lightweight Amiga CLI launcher, not the\"",
            "Echo \"full Koronos/Aurora/Marine modern desktop runtime.\"",
            "Echo \"The CLI prompt remains available for user commands.\"",
            "Echo \"\"",
        ]) + "\n"
        about_text = (
            f"{profile['title']}\n{profile['subtitle']}\n"
            f"Visual theme: {profile['color']}\n\n"
            "This ADF contains a bootable AmigaDOS OFS volume and a "
            "Kickstart 1.x-compatible boot block. The startup sequence "
            "prints a profile-specific menu in the Amiga CLI.\n\n"
            "It does not contain Kickstart ROMs, Workbench binaries, "
            "modern OS application binaries, a Koronos kernel, or a "
            "native Amiga GUI port. Those components are not fabricated.\n"
        )
        readme_text = (
            "CHIMERA / OCTAVIAN AMIGA FLOPPY EDITION\n"
            "========================================\n\n"
            f"{profile['title']}\n{profile['subtitle']}\n\n"
            "Boot target: Amiga 500-class 68000, Kickstart 1.3-compatible.\n"
            "Disk: standard 880 KiB ADF, OFS (DOS0).\n\n"
            "EMULATOR SETUP\n"
            "1. Configure an Amiga 500 / OCS machine profile.\n"
            "2. Supply your own legally obtained Kickstart 1.3 ROM.\n"
            "3. Insert this ADF in DF0: and boot from floppy.\n"
            "4. The startup sequence displays a CLI desktop menu.\n\n"
            "MENU COMMANDS\n"
            + "\n".join("  " + command for command in profile["commands"])
            + "\n\n"
            "LIMITATIONS\n"
            "This is a genuine bootable floppy launcher, not a port of the "
            "modern Aurora/Marine desktop compositor. A 880 KiB ADF cannot "
            "contain the modern OS, web browser, X server, or its application "
            "catalogue. No copyrighted Kickstart/Workbench ROM or binaries "
            "are included.\n"
        )
        write_text(startup, startup_text)
        write_text(about, about_text)
        write_text(readme, readme_text)

        if image.exists():
            image.unlink()
        run(str(image), "format", profile["volume"], "ofs")
        run(str(image), "boot", "install", "boot1x")
        run(str(image), "makedir", "S")
        run(str(image), "write", str(startup), "S/Startup-Sequence")
        run(str(image), "write", str(about), "S/ABOUT.TXT")
        run(str(image), "write", str(readme), "README.TXT")

        if image.stat().st_size != ADF_BYTES:
            raise SystemExit(f"{image.name}: expected {ADF_BYTES} bytes, got {image.stat().st_size}")
        with image.open("rb") as stream:
            boot = stream.read(1024)
        if boot[:4] != b"DOS\\0":
            raise SystemExit(f"{image.name}: missing AmigaDOS boot signature")
        listing = run(str(image), "list")
        if "Startup-Sequence" not in listing or "README.TXT" not in listing:
            raise SystemExit(f"{image.name}: required boot/menu files are missing")
        extracted_startup = run(str(image), "type", "S/Startup-Sequence")
        if profile["title"] not in extracted_startup:
            raise SystemExit(f"{image.name}: startup sequence content mismatch")

        manifest["disks"].append({
            "file": profile["file"],
            "volume": profile["volume"],
            "size_bytes": image.stat().st_size,
            "sha256": hashlib.sha256(image.read_bytes()).hexdigest(),
            "boot_signature": boot[:4].decode("ascii", errors="replace"),
            "startup_sequence": "S/Startup-Sequence",
            "validation": "ADF size, DOS signature, filesystem listing and startup text verified",
        })
        startup.unlink()
        about.unlink()
        readme.unlink()
        print(f"PASS {profile['file']} {image.stat().st_size} bytes")
    (OUT / "manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Generated and inspected {len(manifest['disks'])} Amiga ADF floppy images")


if __name__ == "__main__":
    main()
