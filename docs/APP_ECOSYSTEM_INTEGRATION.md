# Application ecosystem integration and GUI acceptance plan

Updated: 2026-10-22

This plan coordinates the public application hub, ChimeraIIOS, and OctavianOS. It is an implementation checklist, not a claim that every upstream application has been ported, built, published, or tested.

## Repository inventory in scope

- `amerhwitat/amerhwitat.github.io` — app hub, search index, web GUI builds, local-link/catalog validation, GitHub Pages deployment.
- `amerhwitat/ChimeraIIOS` — native OS, Koronos kernel/runtime, Aurora desktop, native and hosted applications.
- `amerhwitat/OctavianOS` — successor OS, vendored Chimera source, Koronos boot/runtime, Aurora and Marine desktop surfaces.
- Related app repositories currently visible in the account inventory: `nlp`, `PDFreaderPY`, `CPU4096`, `CPU4096Simulator`, `BizX`, `BizXtreme`, `eth-key-check`, `bruteforce`, `keygen`, `general`, `test`. Each requires its own build, license, dependency, and runtime review before integration.

## Required application lifecycle

1. Inventory source files, language, entry point, dependencies, build/test commands, license, assets, and upstream URL.
2. Classify the artifact as GUI app, GUI-capable library, CLI/developer tool, service, driver, firmware, kernel component, or data/resource package. Do not force libraries, daemons, drivers, or command-line tools into a GUI-only shape; provide an accessible GUI front end where useful and retain their stable API/CLI.
3. Build a browser GUI where it can run safely in a browser (HTML/CSS/JS/WASM); otherwise build a native GUI adapter using the project's supported toolkit and record platform/provider requirements. Never claim browser execution of native code.
4. Add an app manifest entry with unique ID, title, category, languages, source repository, local published path or upstream URL, license, build status, test evidence, supported OS/architectures, and launch/provider requirements.
5. Run the real build and tests for each target. A catalog entry or a successful compile alone is not runtime acceptance.
6. Validate every local link and app-catalog destination; run JavaScript syntax checks, unit tests, and the Pages build/deployment workflow.
7. Add suitable apps to Aurora Application Center and OctavianOS Application Center only through a verified launcher/provider. Keep unavailable items visible as unavailable, not falsely launchable.
8. Rebuild and test both OS distributions separately. Native support requires actual target execution evidence; host/web prototypes are labeled as such.
9. Publish app artifacts and the updated search index to GitHub Pages only after validation. Preserve upstream license notices and do not bundle proprietary binaries without redistribution rights.

## Desktop integration

- Aurora Wayland Glass Desktop: searchable app launcher, category views, favorites, recent apps, app details, install/provider status, permissions, accessibility, window/task management, and clear unavailable/error states.
- Marine Desktop: conventional taskbar/start menu, categorized application list, pinned apps, settings shortcuts, and the same provider/permission model.
- Shared Control Panel categories: System, Appearance, Desktop/Sessions, Network, Devices/Drivers, Security/Privacy, Compatibility, Applications, Developer/Diagnostics, Power, Storage, and Accessibility.
- Read actual capability and provider state before enabling actions. A UI control without a functioning backend must be disabled with a reason.
- Driver assistance must remain sandboxed and advisory; require signed manifests, ABI checks, bounded probes, rollback, and acceptance tests. Model output must never be loaded as kernel code.

## Browser GUI delivered in this branch

- `apps/pdf-reader.html` is a new local-first PDF viewer UI. It previews a user-selected PDF through the browser's built-in PDF support, keeps file handling client-side, releases object URLs when closed, and clearly states that OCR, extraction, annotation, and historical-script analysis are not implemented in this UI.
- The homepage `APPS` catalog now links to the viewer, and `apps/index.html` no longer points its PDF Reader item at the previously unresolved `apps/pdf-reader/index.html` path.
- This is a browser GUI for viewing only; it is not a native PDFreaderPY port and does not establish that the Python processing backend is available inside either OS.

## Catalog validation implemented in this branch

- `scripts/check_optional_apps_catalog.py` validates catalog schema, unique IDs, ISO update date, HTTPS upstream URLs, platform values, required license metadata, and fail-closed installation/launchability defaults.
- `tests/test_optional_apps_catalog.py` covers valid data and regression cases for duplicate IDs, unsafe default-installed flags, non-HTTPS URLs, and unsupported/malformed platform metadata.
- `.github/workflows/app-catalog-validation.yml` runs the validator and unit tests on relevant pull requests, main-branch changes, and manual dispatch. This workflow validates catalog metadata; it does not certify native app compatibility or OS readiness.

## Cross-platform catalog policy

Windows, Linux, and macOS applications are upstream discovery targets, not blanket compatibility guarantees. For each entry, record the actual native package provider, compatibility runtime, remote/web alternative, emulation route, or unsupported state. Respect upstream licenses, platform restrictions, hardware requirements, and proprietary redistribution terms.

## Release gates

- [ ] Repository/app inventory generated and reviewed.
- [ ] Every published local app path resolves; broken links fail CI.
- [ ] Each GUI app has keyboard accessibility, responsive layout, visible errors, and smoke tests.
- [ ] Native/hosted/browser execution modes are explicitly distinguished.
- [ ] Both desktop launchers consume validated app manifests and real provider status.
- [ ] ChimeraIIOS BIOS/UEFI Live, Installer, Recovery acceptance passes for all six target/firmware cases.
- [ ] OctavianOS independently passes the same six-case matrix.
- [ ] Real init executes at CPL 3 and emits PID-bound syscall/readiness evidence.
- [ ] Persistent storage, service supervision, Aurora session handoff, installer write/verify/reboot, recovery repair, and AP-backed SMP are verified.
- [ ] Pages deployment and post-deployment link smoke tests pass.
- [ ] Release artifacts are published only after all required gates pass.

## Current known blockers to retain

The OctavianOS PR #112 userspace verifier previously failed for Live, Installer, and Recovery because CPL3 user-originated init syscall acknowledgement and actual init PID readiness markers were missing. The native build/ISO smoke path did not prove userspace readiness. ChimeraIIOS full ISO and command/build metadata checks also had failures in the inspected workflow set. Do not weaken acceptance gates to turn these failures green; fix the underlying implementation and rerun the unchanged tests.
