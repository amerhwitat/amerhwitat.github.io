#!/usr/bin/env python3
"""Check published local links and static asset references.

This checker is intentionally static: it never downloads or executes project code.
"""
import re
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
SCANNED_SUFFIXES = {".html", ".js", ".css", ".json"}
files = [
    p for p in ROOT.rglob("*")
    if p.is_file() and p.suffix.lower() in SCANNED_SUFFIXES
    and not any(part in {".git", "node_modules", ".venv"} for part in p.parts)
]
errors = []
checked = 0

ATTR_PATTERN = re.compile(
    r"""(?:\s|<)(?:href|src|action|poster)\s*=\s*["']([^"']+)["']""", re.I
)
SRCSET_PATTERN = re.compile(r"""\bsrcset\s*=\s*["']([^"']+)["']""", re.I)
LOCATION_PATTERN = re.compile(
    r"""location\.(?:href|assign|replace)\s*=\s*["']([^"']+)["']""", re.I
)
LOCATION_CALL_PATTERN = re.compile(
    r"""(?:window\.)?location\.(?:assign|replace)\s*\(\s*["']([^"']+)["']""", re.I
)
FRAGMENT_PATTERN = re.compile(r"""\b(?:id|name)\s*=\s*["']([^"']+)["']""", re.I)
CSS_URL_PATTERN = re.compile(r"""url\(\s*["']?([^)'"]+)["']?\s*\)""", re.I)
CSS_IMPORT_PATTERN = re.compile(r"""@import\s+(?:url\(\s*)?["']([^"']+)["']""", re.I)


def has_fragment(path, fragment):
    """Return whether an HTML document declares an id/name target."""
    if not fragment or path.suffix.lower() != ".html" or not path.is_file():
        return False
    try:
        source = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return False
    return any(unquote(value) == fragment for value in FRAGMENT_PATTERN.findall(source))


def check(base, raw):
    """Record missing local files and broken HTML fragment destinations."""
    global checked
    raw = raw.strip()
    if (
        not raw
        or raw.startswith((
            "\u0024{", "javascript:", "mailto:", "tel:", "data:", "blob:",
            "http://", "https://", "//", "fs-uae:", "chimera:", "about:"
        ))
        or "\u0024{" in raw
        or raw.startswith((chr(96), "+"))
    ):
        return

    # Validate in-page anchors only in HTML sources. Hashes in JS/CSS are often
    # selectors or asset identifiers, not navigational fragments.
    if raw.startswith("#"):
        if base.suffix.lower() == ".html":
            fragment = unquote(raw[1:].split("?", 1)[0])
            checked += 1
            if not has_fragment(base, fragment):
                errors.append(f"{base.relative_to(ROOT)} -> {raw} -> missing fragment #{fragment}")
        return

    before_fragment, separator, fragment = raw.partition("#")
    raw_path = unquote(before_fragment.split("?", 1)[0])
    if not raw_path:
        return
    # Leading slash is rooted at the published site, not the runner filesystem.
    target = (ROOT / raw_path.lstrip("/")) if raw_path.startswith("/") else (base.parent / raw_path)
    target = target.resolve()
    try:
        relative = target.relative_to(ROOT.resolve()).as_posix()
    except ValueError:
        return
    checked += 1
    if target.is_file() or (target.is_dir() and (target / "index.html").is_file()):
        fragment_target = target / "index.html" if target.is_dir() else target
        if separator and fragment and fragment_target.suffix.lower() == ".html":
            decoded_fragment = unquote(fragment.split("?", 1)[0])
            if not has_fragment(fragment_target, decoded_fragment):
                errors.append(
                    f"{base.relative_to(ROOT)} -> {raw} -> missing fragment "
                    f"#{decoded_fragment} in {fragment_target.relative_to(ROOT)}"
                )
        return
    errors.append(f"{base.relative_to(ROOT)} -> {raw} -> missing {relative}")

def check_srcset(base, value):
    # srcset is a comma-separated list of URL + optional descriptor pairs.
    # A data URI contains a comma of its own; avoid mis-parsing such an attribute.
    if value.strip().lower().startswith("data:"):
        return
    for candidate in value.split(","):
        parts = candidate.strip().split()
        if parts:
            check(base, parts[0])


def main():
    global errors, checked
    errors = []
    checked = 0
    for path in files:
        if path.name == "search-index.json":
            continue
        try:
            source = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for match in ATTR_PATTERN.finditer(source):
            check(path, match.group(1))
        for match in SRCSET_PATTERN.finditer(source):
            check_srcset(path, match.group(1))
        for match in LOCATION_PATTERN.finditer(source):
            check(path, match.group(1))
        for match in LOCATION_CALL_PATTERN.finditer(source):
            check(path, match.group(1))
        # CSS image/font assets and stylesheet imports are not HTML href/src attributes.
        if path.suffix.lower() == ".css":
            for match in CSS_URL_PATTERN.finditer(source):
                check(path, match.group(1))
            for match in CSS_IMPORT_PATTERN.finditer(source):
                check(path, match.group(1))
    print(f"Checked {checked} local links and static asset references.")
    if errors:
        print("\n".join(errors[:200]))
        print(f"FAILED: {len(errors)} missing local references.")
        sys.exit(1)
    print("PASS: no missing local links or static asset references detected.")


if __name__ == "__main__":
    main()
