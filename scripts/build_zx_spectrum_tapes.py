#!/usr/bin/env python3
"""Build four ZX Spectrum 48K tape images containing real Z80 launch screens.

Each TAP contains a Spectrum CODE block loaded at 32768. On a 48K Spectrum,
enter: LOAD "" CODE 32768 : RANDOMIZE USR 32768
This is a small machine-code title/menu screen, not a port of the modern OS GUI.
"""
from __future__ import annotations
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "downloads" / "retro-tapes"
BASE = 0x8000
PROFILES = [
    ("chimera-aurora.tap", "CHIMERA II OS - AURORA", "GLASS / RESEARCH DESKTOP"),
    ("chimera-marine.tap", "CHIMERA II OS - MARINE", "PRODUCTIVITY DESKTOP"),
    ("octavian-aurora.tap", "OCTAVIAN OS - AURORA", "CREATIVE GLASS DESKTOP"),
    ("octavian-marine.tap", "OCTAVIAN OS - MARINE", "WINDOWED PRODUCTIVITY"),
]

def xor(data: bytes) -> int:
    value = 0
    for byte in data:
        value ^= byte
    return value

def tap_block(payload: bytes) -> bytes:
    framed = payload + bytes([xor(payload)])
    return len(framed).to_bytes(2, "little") + framed

def make_code(title: str, subtitle: str) -> bytes:
    message = (title + "\r" + subtitle + "\r\r"
               "ZX SPECTRUM 48K TAPE EDITION\r"
               "ENTER BASIC COMMANDS AFTER RETURN\r"
               "NOT THE FULL KORONOS GUI\r\r\0").encode("ascii")
    # LD HL, message; loop: LD A,(HL); OR A; JR Z,done; RST 10h;
    # INC HL; JR loop; done: RET. Relative branches are calculated below.
    code = bytearray([0x21, 0, 0, 0x7E, 0xB7, 0x28, 0x04,
                      0xD7, 0x23, 0x18, 0xF8, 0xC9])
    message_addr = BASE + len(code)
    code[1:3] = message_addr.to_bytes(2, "little")
    code.extend(message)
    return bytes(code)

def make_tap(title: str, subtitle: str) -> bytes:
    code = make_code(title, subtitle)
    name = (title[:10]).ljust(10).encode("ascii")
    header = bytes([0x00, 0x03]) + name + len(code).to_bytes(2, "little") + BASE.to_bytes(2, "little") + BASE.to_bytes(2, "little")
    data = bytes([0xFF]) + code
    return tap_block(header) + tap_block(data)

def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {
        "schema": "chimera-octavian-retro-tape/v1",
        "format": "ZX Spectrum TAP",
        "machine": "Sinclair ZX Spectrum 48K",
        "load_address": BASE,
        "load_instructions": 'LOAD "" CODE 32768 : RANDOMIZE USR 32768',
        "scope": "Real Z80 machine-code profile title/menu screen; not a modern GUI desktop port",
        "images": [],
    }
    for filename, title, subtitle in PROFILES:
        path = OUT / filename
        content = make_tap(title, subtitle)
        path.write_bytes(content)
        # Parse the two TAP blocks and validate lengths, flags and XOR checksums.
        offset = 0
        blocks = []
        while offset < len(content):
            if offset + 2 > len(content):
                raise SystemExit(f"{filename}: truncated TAP block length")
            length = int.from_bytes(content[offset:offset+2], "little")
            block = content[offset+2:offset+2+length]
            if len(block) != length or length < 2 or xor(block) != 0:
                raise SystemExit(f"{filename}: invalid TAP block/checksum")
            blocks.append(block)
            offset += 2 + length
        if offset != len(content) or len(blocks) != 2:
            raise SystemExit(f"{filename}: expected exactly header and CODE blocks")
        if blocks[0][0] != 0x00 or blocks[0][1] != 0x03:
            raise SystemExit(f"{filename}: invalid CODE header")
        if blocks[1][0] != 0xFF or blocks[1][1:1+len(make_code(title, subtitle))] != make_code(title, subtitle):
            raise SystemExit(f"{filename}: invalid CODE data block")
        manifest["images"].append({
            "file": filename,
            "size_bytes": len(content),
            "sha256": hashlib.sha256(content).hexdigest(),
            "blocks": len(blocks),
            "load_address": BASE,
            "validation": "TAP block lengths, flags, XOR checksums and Z80 payload verified",
        })
        print(f"PASS {filename} ({len(content)} bytes)")
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print("Generated and verified four ZX Spectrum TAP images")

if __name__ == "__main__":
    main()
