# Release evidence gate (fail closed)

Run:

```sh
python3 scripts/release-evidence-check.py path/to/evidence.json
```

The gate requires six independent target/firmware cases (Live, Installer, Recovery × BIOS, UEFI), each with a PASS status, a SHA-256 artifact digest, a log reference, and a real userspace-ready observation. It also requires explicit evidence references for production userspace, service lifecycle, desktop handoff, real SMP, and the ISO artifact.

The checker deliberately rejects missing, unknown, or non-PASS values. Do not fabricate results to make the gate pass. Reviewers must open each referenced artifact/log and verify that the evidence is from the stated commit and that readiness originated from the executing userspace process. Passing this schema check is not itself proof that the OS works.

Website publication is a separate gate: require the catalog workflow and Pages deployment to succeed on the same commit, then verify the deployed commit and live URLs, browser console, fullscreen, and response headers. Never use this script as a substitute for those checks.
