#!/usr/bin/env python3
"""Static safety/coverage checks for the repository workbench page."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "apps/project-workbench.html"
html = PAGE.read_text(encoding="utf-8")

required = [
    'lang="en"', 'name="viewport"', 'id="q"', 'id="stack"',
    'id="coverage"', 'aria-live="polite"', 'aria-label="Project repositories"',
    'rel="noopener noreferrer"', 'textContent=p.name',
    'https://github.com/amerhwitat/ChimeraIIOS',
    'https://github.com/amerhwitat/OctavianOS',
    'https://github.com/amerhwitat/PDFreaderPY',
    'https://github.com/amerhwitat/CPU4096Simulator',
]
for fragment in required:
    assert fragment in html, f"Missing workbench contract: {fragment}"

project_ids = re.findall(r'\{id:"([a-z0-9-]+)",name:"([^"]+)"', html)
assert len(project_ids) >= 14, f"Expected at least 14 inventoried repositories, got {len(project_ids)}"
ids = [project_id for project_id, _ in project_ids]
assert len(ids) == len(set(ids)), "Duplicate project IDs"
assert 'target="_blank"' in html
assert "innerHTML" not in html, "Render untrusted project data without innerHTML"
assert 'coverage:"pending"' in html, "Keep unconverted projects explicitly visible"
assert "not a claim that every file in every repository has been migrated" in html
assert 'https://amerhwitat.github.io/apps/pdf-reader.html' in html
assert 'Access-gated; no source or language claims made.' in html
print(f"PASS: {len(project_ids)} project records, unique IDs, accessible filters, safe DOM rendering, source links and explicit coverage boundaries")
