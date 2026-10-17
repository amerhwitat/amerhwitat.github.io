#!/usr/bin/env python3
"""Refresh the static Python file catalog from public GitHub repository trees.

This inventories source files only. It does not execute code or claim that each
Python module has been ported to a browser-native implementation.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import PurePosixPath
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "apps/chimera-ii-os/web/wallet-python-catalog.json"
SCHEMA = "aurora-wallet-python-catalog/v1"
REPOSITORIES = [
    ("BizXtreme", "main"),
    ("amerhwitat.github.io", "main"),
    ("keygen", "main"),
    ("PDFreaderPY", "main"),
    ("bruteforce", "main"),
    ("general", "master"),
    ("CPU4096", "main"),
    ("test", "main"),
    ("CPU4096Simulator", "main"),
    ("eth-key-check", "main"),
    ("BizX", "main"),
    ("ChimeraIIOS", "main"),
    ("nlp", "main"),
    ("OctavianOS", "main"),
]
TEST_PARTS = {"test", "tests", "testing"}
ENTRYPOINT_NAMES = {
    "app.py", "main.py", "__main__.py", "run.py", "server.py",
    "web_app.py", "desktop.py", "gui.py", "cli.py",
}
def request_json(url: str) -> dict:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "amerhwitat-python-web-workbench",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        headers["Authorization"] = "Bearer " + token
    request = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:500]
        raise RuntimeError(f"GitHub API {exc.code} for {url}: {detail}") from exc

def classify(path: str) -> tuple[str, str, bool, str]:
    p = PurePosixPath(path)
    parts = {part.lower() for part in p.parts}
    name = p.name.lower()
    if any(part in TEST_PARTS for part in parts) or name.startswith("test_") or name.endswith("_test.py"):
        return "test", "test", False, ""
    if name == "__init__.py" or "lib" in parts or "library" in parts:
        role = "library"
    elif name in ENTRYPOINT_NAMES or name.endswith(("_gui.py", "_app.py", "_desktop.py")):
        role = "entrypoint"
    else:
        role = "module"
    if any(token in path.lower() for token in ("crypto", "keygen", "wallet", "hash", "bruteforce")):
        kind = "crypto-research"
    elif any(token in path.lower() for token in ("ai", "nlp", "model", "neural", "ocr", "translation")):
        kind = "ai"
    elif any(token in path.lower() for token in ("web", "gui", "app.py", "desktop", "frontend", "server.py")):
        kind = "web-app"
    elif any(token in path.lower() for token in ("scripts/", "tools/", "build", "catalog", "lint")):
        kind = "tooling"
    else:
        kind = "python"
    runnable = role == "entrypoint"
    command = f"python3 {path}" if runnable else ""
    return kind, role, runnable, command

def main() -> int:
    records: list[dict] = []
    repositories: list[dict] = []
    by_repository: dict[str, int] = {}
    for repo, branch in REPOSITORIES:
        url = f"https://api.github.com/repos/amerhwitat/{repo}/git/trees/{branch}?recursive=1"
        tree = request_json(url)
        if tree.get("truncated"):
            raise RuntimeError(f"GitHub returned a truncated tree for {repo}; refusing to publish an incomplete catalog")
        files = [item for item in tree.get("tree", [])
                 if item.get("type") == "blob" and item.get("path", "").lower().endswith(".py")]
        by_repository[repo] = len(files)
        repositories.append({"repo": repo, "branch": branch, "python_files": len(files)})
        for item in files:
            path = item["path"]
            kind, role, runnable, command = classify(path)
            records.append({
                "repo": repo,
                "branch": branch,
                "path": path,
                "size": int(item.get("size", 0)),
                "sha": item.get("sha", ""),
                "kind": kind,
                "url": f"https://github.com/amerhwitat/{repo}/blob/{branch}/{path}",
                "role": role,
                "runnable": runnable,
                "python_command": command,
            })
        print(f"{repo}: {len(files)} Python files")
    records.sort(key=lambda item: (item["repo"].casefold(), item["path"].casefold()))
    test_count = sum(item["role"] == "test" for item in records)
    runnable_count = sum(item["runnable"] for item in records)
    catalog = {
        "schema": SCHEMA,
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "scope": "Python files in the configured public repositories owned by amerhwitat",
        "repositories": repositories,
        "files": records,
        "summary": {
            "repositories": len(repositories),
            "total_python_files": len(records),
            "by_repository": by_repository,
            "runnable_files": runnable_count,
            "library_or_module_files": sum(item["role"] in {"library", "module"} for item in records),
            "test_files": test_count,
        },
    }
    OUTPUT.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Python catalog refreshed: {len(records)} files / {len(repositories)} repositories / {runnable_count} entrypoints")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
