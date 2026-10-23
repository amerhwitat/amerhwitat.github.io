#!/usr/bin/env python3
"""Fail-closed release gate for ChimeraIIOS and OctavianOS.

Input is a JSON evidence manifest. A PASS requires actual artifact/test evidence;
source inspection, compile success, and simulated terminal output are not evidence.
Exit 0 only when every mandatory gate is explicitly PASS.
"""
import json
import sys
from pathlib import Path

TARGETS = ("live", "installer", "recovery")
FIRMWARE = ("bios", "uefi")
BOOL_GATES = (
    "production_userspace",
    "service_lifecycle",
    "desktop_handoff",
    "real_smp",
    "iso_artifact_verified",
)

def fail(message):
    print("BLOCKED: " + message, file=sys.stderr)
    return 2

def main():
    if len(sys.argv) != 2:
        return fail("usage: release-evidence-check.py evidence.json")
    path = Path(sys.argv[1])
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        return fail(f"cannot read valid evidence JSON: {exc}")
    errors = []
    if data.get("schema_version") != 1:
        errors.append("schema_version must be 1")
    if not data.get("commit"):
        errors.append("commit SHA is required")
    cases = data.get("acceptance", {})
    for target in TARGETS:
        for firmware in FIRMWARE:
            key = f"{target}_{firmware}"
            case = cases.get(key, {})
            if case.get("status") != "PASS":
                errors.append(f"{key} must be PASS")
            if not case.get("artifact_sha256"):
                errors.append(f"{key}: artifact_sha256 missing")
            if not case.get("log"):
                errors.append(f"{key}: log reference missing")
            if case.get("userspace_ready") is not True:
                errors.append(f"{key}: userspace_ready must be true")
    for gate in BOOL_GATES:
        value = data.get(gate, {})
        if value.get("status") != "PASS" or not value.get("evidence"):
            errors.append(f"{gate} needs PASS plus evidence reference")
    if errors:
        print("RELEASE BLOCKED")
        for item in errors:
            print(f"- {item}")
        return 1
    print(f"RELEASE EVIDENCE ACCEPTED for commit {data['commit']}")
    print("This validates the supplied manifest only; reviewers must verify every referenced artifact and log.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
