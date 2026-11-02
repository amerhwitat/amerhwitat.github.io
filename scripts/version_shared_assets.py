#!/usr/bin/env python3
"""Apply versioned shared interaction assets to every published HTML page.

The transformation is idempotent: existing references are cache-busted in
place, and missing references are inserted once in the document head/body.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SKIPPED = {".git", "node_modules", ".venv"}
VERSION = "3"

ASSET_REFERENCE = re.compile(
    r"""(?P<prefix>\b(?:href|src)\s*=\s*)(?P<quote>["'])(?P<url>[^"'?#]*site-interactions\.(?:css|js))(?:\?[^"']*)?(?P=quote)""",
    re.IGNORECASE,
)


def transform_html(source):
    """Return HTML with current shared-asset versions and missing tags added."""
    def version(match):
        url = match.group("url")
        return f'{match.group("prefix")}{match.group("quote")}{url}?v={VERSION}{match.group("quote")}'

    updated = ASSET_REFERENCE.sub(version, source)
    if not re.search(r"""\bhref\s*=\s*["'][^"']*site-interactions\.css(?:\?[^"']*)?["']""", updated, re.I):
        if re.search(r"</head\s*>", updated, re.I):
            updated = re.sub(
                r"</head\s*>",
                f'  <link rel="stylesheet" href="/site-interactions.css?v={VERSION}">\n</head>',
                updated,
                count=1,
                flags=re.I,
            )
    if not re.search(r"""\bsrc\s*=\s*["'][^"']*site-interactions\.js(?:\?[^"']*)?["']""", updated, re.I):
        if re.search(r"</body\s*>", updated, re.I):
            updated = re.sub(
                r"</body\s*>",
                f'  <script src="/site-interactions.js?v={VERSION}" defer></script>\n</body>',
                updated,
                count=1,
                flags=re.I,
            )
    return updated


def main():
    changed = 0
    unreadable = []
    for page in ROOT.rglob("*.html"):
        if any(part in SKIPPED for part in page.parts):
            continue
        try:
            source = page.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError) as exc:
            unreadable.append(f"{page.relative_to(ROOT)}: {exc}")
            continue
        updated = transform_html(source)
        if updated != source:
            page.write_text(updated, encoding="utf-8")
            changed += 1
    print(f"Shared interaction assets refreshed on {changed} HTML pages.")
    if unreadable:
        raise SystemExit("Could not safely process HTML pages:\n" + "\n".join(unreadable))


if __name__ == "__main__":
    main()
