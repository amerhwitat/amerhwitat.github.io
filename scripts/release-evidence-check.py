#!/usr/bin/env python3
"""Fail-closed DAPS release gate for ChimeraIIOS and OctavianOS.

This validates the structure and minimum provenance of an evidence manifest. It
cannot authenticate logs, execute the kernel, or prove hardware behavior; a
reviewer must independently inspect each referenced artifact and trace.
"""
import json
import re
import sys
from pathlib import Path

TARGETS = ("live", "installer", "recovery")
FIRMWARE = ("bios", "uefi")
GATES = (
    "production_userspace",
    "service_lifecycle",
    "desktop_handoff",
    "real_smp",
    "iso_artifact_verified",
)
MARKERS = {
    "live": "USERSPACE READY: live init pid=",
    "installer": "USERSPACE READY: installer init pid=",
    "recovery": "USERSPACE READY: recovery init pid=",
}
SHA40 = re.compile(r"[0-9a-fA-F]{40}")
SHA256 = re.compile(r"[0-9a-fA-F]{64}")


def fail(message):
    print("BLOCKED: " + message, file=sys.stderr)
    return 2


def is_text(value):
    return isinstance(value, str) and bool(value.strip())


def main():
    if len(sys.argv) != 2:
        return fail("usage: release-evidence-check.py evidence.json")
    try:
        data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        return fail(f"cannot read valid UTF-8 JSON evidence: {exc}")
    if not isinstance(data, dict):
        return fail("manifest root must be a JSON object")

    errors = []
    commit = data.get("commit")
    if data.get("schema_version") != 1:
        errors.append("schema_version must be 1")
    if not isinstance(commit, str) or not SHA40.fullmatch(commit):
        errors.append("commit must be a full 40-character Git SHA")

    cases = data.get("acceptance")
    if not isinstance(cases, dict):
        cases = {}
        errors.append("acceptance must be an object containing six target/firmware cases")

    for target in TARGETS:
        for firmware in FIRMWARE:
            key = f"{target}_{firmware}"
            case = cases.get(key)
            if not isinstance(case, dict):
                errors.append(f"{key} must be an evidence object")
                continue
            if case.get("status") != "PASS":
                errors.append(f"{key}: status must be PASS")
            digest = case.get("artifact_sha256")
            if not isinstance(digest, str) or not SHA256.fullmatch(digest):
                errors.append(f"{key}: artifact_sha256 must be a 64-character SHA-256 digest")
            if not is_text(case.get("log")):
                errors.append(f"{key}: log reference missing")
            elif not (case["log"].startswith("https://") or case["log"].startswith("artifacts/")):
                errors.append(f"{key}: log must be an https URL or artifacts/ relative path")
            if case.get("userspace_ready") is not True:
                errors.append(f"{key}: userspace_ready must be true")
            if case.get("observed_commit") != commit:
                errors.append(f"{key}: observed_commit must equal manifest commit")
            marker = case.get("ready_marker")
            if marker != MARKERS[target]:
                errors.append(f"{key}: ready_marker must be the target-specific userspace marker")
            pid = case.get("init_pid")
            if not isinstance(pid, int) or isinstance(pid, bool) or pid < 1:
                errors.append(f"{key}: init_pid must be a positive integer observed in the log")
            if case.get("evidence_kind") != "executed-process":
                errors.append(f"{key}: evidence_kind must be executed-process, not source/build-only")

    for gate in GATES:
        item = data.get(gate)
        if not isinstance(item, dict):
            errors.append(f"{gate} must be an object")
            continue
        if item.get("status") != "PASS":
            errors.append(f"{gate}: status must be PASS")
        if not is_text(item.get("evidence")):
            errors.append(f"{gate}: evidence reference missing")
        if item.get("observed_commit") != commit:
            errors.append(f"{gate}: observed_commit must equal manifest commit")
        if item.get("evidence_kind") != "independently-reviewed":
            errors.append(f"{gate}: evidence_kind must be independently-reviewed")

    if errors:
        print("RELEASE BLOCKED")
        for item in errors:
            print(f"- {item}")
        return 1
    print(f"MANIFEST STRUCTURE ACCEPTED for commit {commit}")
    print("NOT A RELEASE AUTHORIZATION: independently inspect all logs, artifacts, hashes, and execution provenance.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
