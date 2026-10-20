#!/usr/bin/env python3
"""Check stable IDs, required fields, and local targets in the app catalogs."""
import json
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "apps/chimera-ii-os/web/aurora_apps.json"
INDEX = ROOT / "search-index.json"


def target_problem(raw):
    raw = unquote(raw.strip())
    parsed = urlsplit(raw)
    if parsed.scheme in ("http", "https", "mailto") or raw.startswith("//"):
        return None
    path = parsed.path
    if not path:
        return None
    base = ROOT if path.startswith("/") else REGISTRY.parent
    candidate = (base / path.lstrip("/")).resolve()
    if candidate.is_file() or (candidate.is_dir() and (candidate / "index.html").is_file()):
        return None
    return "missing local target"


def check_apps(data):
    errors = []
    if not isinstance(data, dict) or data.get("schema") != "chimera-aurora-apps/v13":
        return ["unexpected Aurora schema"]
    seen = set()
    for category in data.get("categories", []):
        for app in category.get("apps", []):
            app_id = app.get("id")
            if not app_id:
                errors.append("app entry missing id")
            elif app_id in seen:
                errors.append("duplicate Aurora app id: " + app_id)
            else:
                seen.add(app_id)
            if not app.get("title"):
                errors.append("app " + str(app_id) + " missing title")
            if not app.get("mode"):
                errors.append("app " + str(app_id) + " missing mode")
            targets = [app.get(k) for k in ("target", "url") if isinstance(app.get(k), str) and app.get(k).strip()]
            if not targets:
                errors.append("app " + str(app_id) + " missing launch target")
            for target in targets:
                issue = target_problem(target)
                if issue:
                    errors.append("app " + str(app_id) + " target " + repr(target) + ": " + issue)
    return errors


def check_index(data):
    errors, seen = [], set()
    if not isinstance(data, dict) or not isinstance(data.get("pages"), list):
        return ["search index missing pages array"]
    for page in data["pages"]:
        path = page.get("p")
        if not path:
            errors.append("search index entry missing path")
        elif path in seen:
            errors.append("duplicate search index path: " + path)
        else:
            seen.add(path)
        if not page.get("t"):
            errors.append("search index entry missing title for " + str(path))
    return errors


def main():
    try:
        apps = json.loads(REGISTRY.read_text(encoding="utf-8"))
        index = json.loads(INDEX.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print("FAIL: catalog JSON could not be loaded:", exc, file=sys.stderr)
        return 2
    errors = check_apps(apps) + check_index(index)
    app_count = sum(len(c.get("apps", [])) for c in apps.get("categories", []))
    page_count = len(index.get("pages", []))
    if errors:
        print("FAIL:", len(errors), "issue(s);", app_count, "Aurora apps;", page_count, "search entries")
        for error in errors:
            print(" -", error)
        return 1
    print("PASS:", app_count, "Aurora entries and", page_count, "search entries validated")
    print("Catalog validation does not prove native execution.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
