#!/usr/bin/env python3
"""Validate every local app destination in the homepage APPS catalog.

External HTTP(S) destinations are retained as external links. Local paths must
resolve inside the published repository to a file or an index.html entry point.
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
HOME = ROOT / "index.html"
APPS_PATTERN = re.compile(r"const APPS = (.*?);\nconst REPOS = ", re.S)


def catalog_targets():
    html = HOME.read_text(encoding="utf-8")
    match = APPS_PATTERN.search(html)
    if not match:
        raise ValueError("Could not find the APPS catalog in index.html")
    apps = json.loads(match.group(1))
    targets = []
    for app in apps:
        title = str(app.get("title", "(untitled app)"))
        for field, label in (("path", "primary"),):
            value = app.get(field, "")
            if isinstance(value, str) and value:
                targets.append((title, label, value))
        for child in app.get("sub", []) or []:
            value = child.get("p", "")
            if isinstance(value, str) and value:
                targets.append((title, str(child.get("t", "sub-app")), value))
    return apps, targets


def resolve_target(raw):
    raw = unquote(raw.strip())
    parsed = urlsplit(raw)
    if parsed.scheme in ("http", "https") or raw.startswith("//"):
        return None
    path = parsed.path
    if not path:
        return None
    relative = path.lstrip("/") if path.startswith("/") else path
    candidate = (ROOT / relative).resolve()
    try:
        candidate.relative_to(ROOT.resolve())
    except ValueError:
        return "path escapes repository root"
    if candidate.is_file():
        return None
    if candidate.is_dir() and (candidate / "index.html").is_file():
        return None
    return f"missing local target: {relative}"


def main():
    try:
        apps, targets = catalog_targets()
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"FAIL: app catalog cannot be parsed: {exc}", file=sys.stderr)
        return 2
    errors = []
    seen = set()
    for title, label, raw in targets:
        key = (title, label, raw)
        if key in seen:
            continue
        seen.add(key)
        problem = resolve_target(raw)
        if problem:
            errors.append(f"{title} [{label}] -> {raw} -> {problem}")
    print(f"Audited {len(apps)} app cards and {len(seen)} primary/sub-app destinations.")
    if errors:
        print("\n".join(errors))
        print(f"FAIL: {len(errors)} unresolved catalog destinations.", file=sys.stderr)
        return 1
    print("PASS: every local app catalog destination resolves to a published file or index page.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
