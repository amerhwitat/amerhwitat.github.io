#!/usr/bin/env python3
"""Validate conservative root-level repository audit evidence."""
import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "apps" / "repository-build-audit.json"
data = json.loads(DATA.read_text(encoding="utf-8"))
assert data.get("schema") == "repository-root-evidence-v1"
assert "not proof" in data.get("evidence_policy", "")
repos = data.get("repositories")
assert isinstance(repos, list) and len(repos) >= 10
ids = [r.get("id") for r in repos]
assert len(ids) == len(set(ids)), "duplicate repository IDs"
for r in repos:
    assert r.get("name") and r.get("id") and r.get("next_step")
    parsed = urlparse(r.get("url", ""))
    assert parsed.scheme == "https" and parsed.netloc == "github.com"
    assert r.get("audit_status") == "root-signals-captured"
    assert isinstance(r.get("root_entries"), list) and r["root_entries"]
    for field in ("build_signals", "test_signals", "api_signals", "gui_signals"):
        assert isinstance(r.get(field), list), f"{r['id']}: missing {field}"
    assert r.get("license_signal"), f"{r['id']}: license signal must be explicit"
assert any(r["id"] == "CPU4096Simulator" and "package.json" in r["build_signals"] for r in repos)
assert any(r["id"] == "PDFreaderPY" and "requirements.txt" in r["build_signals"] for r in repos)
assert any(r["id"] == "BizXtreme" and r["license_signal"] == "not-seen-at-root" for r in repos)
print(f"PASS: {len(repos)} repository root inventories; evidence boundaries and unknowns explicit")
