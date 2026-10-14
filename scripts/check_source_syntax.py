#!/usr/bin/env python3
"""Syntax-check every published JavaScript app and repository-owned Python tool.

This is a syntax/parse gate, not a runtime or security certification. It never
executes application JavaScript or imports Python project modules.
"""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SKIP_PARTS = {".git", "node_modules", "dist", "build", "vendor", ".venv", "__pycache__"}


def main() -> int:
    js_files = sorted(
        p for p in ROOT.rglob("*.js")
        if not any(part in SKIP_PARTS for part in p.relative_to(ROOT).parts)
        and p.name != "vite.config.js"
    )
    py_files = sorted((ROOT / "scripts").rglob("*.py"))
    failures = []
    for path in js_files:
        result = subprocess.run(
            ["node", "--check", str(path)],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
        if result.returncode:
            details = (result.stderr or result.stdout).strip()
            failures.append(f"JavaScript syntax: {path.relative_to(ROOT)}\n{details}")
    for path in py_files:
        try:
            compile(path.read_text(encoding="utf-8"), str(path), "exec")
        except (OSError, SyntaxError, UnicodeError) as exc:
            failures.append(f"Python syntax: {path.relative_to(ROOT)}\n{exc}")
    print(f"Checked {len(js_files)} JavaScript files and {len(py_files)} Python files.")
    if failures:
        print("\n\n".join(failures[:100]), file=sys.stderr)
        print(f"FAIL: {len(failures)} syntax errors.", file=sys.stderr)
        return 1
    print("PASS: all scanned JavaScript and Python files parse successfully.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
