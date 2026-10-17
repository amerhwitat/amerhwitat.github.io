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


def split_statements_for_diagnostics(source: str) -> str:
    """Add line breaks after semicolons outside strings to localize parser errors."""
    output = []
    quote = None
    escaped = False
    for char in source:
        output.append(char)
        if quote:
            if escaped:
                escaped = False
            elif char == chr(92):
                escaped = True
            elif char == quote:
                quote = None
            continue
        if char in ("'", '"', chr(96)):
            quote = char
        elif char == ";":
            output.append(chr(10))
    return "".join(output)


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
        # Valid browser ES modules may use CDN imports while their folder has no
        # package.json type=module. Retry that specific Node CommonJS diagnostic
        # in module parse mode; the source is parsed, never imported or executed.
        if result.returncode and "Cannot use import statement outside a module" in result.stderr:
            try:
                source = path.read_text(encoding="utf-8")
                result = subprocess.run(
                    ["node", "--input-type=module", "--check"],
                    input=source,
                    cwd=ROOT,
                    text=True,
                    capture_output=True,
                    check=False,
                )
            except OSError as exc:
                failures.append(f"JavaScript syntax: {path.relative_to(ROOT)}\n{exc}")
                continue
        if result.returncode:
            details = (result.stderr or result.stdout).strip()
            lines = (result.stderr or "").splitlines()
            caret_index = next((i for i, line in enumerate(lines) if line.strip() == "^"), None)
            if caret_index is not None and caret_index >= 2:
                caret_line = lines[caret_index]
                column = len(caret_line) - len(caret_line.lstrip(" "))
                try:
                    source = path.read_text(encoding="utf-8")
                    details += (
                        f"\nParser context near column {column}: "
                        f"{source[max(0, column - 80):column + 100]!r}"
                    )
                except OSError:
                    pass
            # Node truncates caret output for very long minified lines. Reparse
            # a diagnostic-only copy with safe statement line breaks to expose
            # the failing line/column without changing the source file.
            try:
                source = path.read_text(encoding="utf-8")
                diagnostic_source = split_statements_for_diagnostics(source)
                diagnostic = subprocess.run(
                    ["node", "--check"],
                    input=diagnostic_source,
                    cwd=ROOT,
                    text=True,
                    capture_output=True,
                    check=False,
                )
                if diagnostic.returncode:
                    details += "\\nDiagnostic parse after line splitting:\\n" + diagnostic.stderr.strip()
            except OSError:
                pass
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
