# Amer Hwitat — Public Research Web

[![GitHub Pages deployment](https://github.com/amerhwitat/amerhwitat.github.io/actions/workflows/pages.yml/badge.svg?branch=main)](https://github.com/amerhwitat/amerhwitat.github.io/actions/workflows/pages.yml) [![Static hub validation](https://github.com/amerhwitat/amerhwitat.github.io/actions/workflows/site-catalog-check.yml/badge.svg?branch=main)](https://github.com/amerhwitat/amerhwitat.github.io/actions/workflows/site-catalog-check.yml)

This repository hosts the public web surface for Amer Hwitat's open research projects, including the Chimera II OS ecosystem.

## Desktop evolution and GUI migration

- **[Desktop Evolution Lab](apps/desktop-evolution/index.html):** interactive Aurora/Marine desktop feature planner covering broad desktop interaction patterns from Windows 3.1/3.11 through current and future-era concepts. It exports a local JSON planning file and does not claim to enable native OS features.
- **[Portfolio GUI Migration Dashboard](apps/portfolio-migration/index.html):** filterable cross-repository inventory of application migration candidates, target technologies and explicit verification states.
- **[Portfolio GUI migration plan](docs/PORTFOLIO_GUI_MIGRATION.md):** architecture and acceptance guidance for Angular/TypeScript, Next.js/TypeScript, Spring Boot APIs, JavaFX/Swing, Python GUI ports, and native-code web bridges.
- **Desktop identities:** retain **Aurora Wayland Glass Desktop** and **Marine Desktop** across ChimeraIIOS and OctavianOS.

## Complete source-code citation index

| Area | Source |
|---|---|
| Public web pages | [repository source tree](.) |
| Chimera public index | [chimera/](chimera/) |
| Apple web companion | [apple/](apple/) |
| Complete tracked repository | [source tree](.) |

The links above are the README-level citations for all maintained web/application code. The repository tree remains the detailed source-of-record boundary.

## Cross-repository application discovery

- **Portfolio hub:** https://amerhwitat.github.io/
- **Recursive app explorer:** https://amerhwitat.github.io/apps/repository-app-explorer/
- **Explorer source:** [apps/repository-app-explorer/index.html](apps/repository-app-explorer/index.html)
- **Regression tests:** [scripts/test_repository_app_explorer.py](scripts/test_repository_app_explorer.py)
- **Audit tracking:** [issue #8](https://github.com/amerhwitat/amerhwitat.github.io/issues/8)

The explorer scans the allowlisted public repository trees using GitHub's unauthenticated API and surfaces likely web pages, manifests, Python entry points, native project files and documentation. It escapes source-derived values before rendering, marks partial/truncated scans, honors reduced-motion preferences and keeps sound opt-in. It does not execute downloaded code, scan private repositories or prove that a detected project builds or runs. GitHub API rate limits and truncated trees can make results incomplete.

The app catalog also links directly to cross-repository projects, while the search-index builder now indexes external project cards from the homepage catalog. CI includes regression assertions for explorer behavior and the generated search index. A passing catalog check is not a substitute for language-specific builds, security review, browser/device tests or native OS boot validation; those remain tracked in issue #8.

## Centralized Apple implementations

The portfolio Apple source tree is centralized at [`general/Apple-Implementations`](https://github.com/amerhwitat/general/tree/master/Apple-Implementations). It contains Objective-C/Xcode and Flutter iOS/macOS companions for the portfolio applications. This web repository remains the public discovery/documentation surface.

## Apple companion application

The `apple/` directory contains a native SwiftUI/Xcode companion shell for iOS/iPadOS and macOS. `apple/project.yml` is generated with XcodeGen and validated on a macOS GitHub Actions runner. The companion consumes public portfolio metadata and does not replace the canonical web source.

## Chimera II OS public research index

- **Public index:** `chimera/index.html`
- **Complete portfolio summary:** https://github.com/amerhwitat/ChimeraIIOS/blob/main/docs/CHIMERA_ECOSYSTEM_PORTFOLIO.md
- **Canonical OS source:** https://github.com/amerhwitat/ChimeraIIOS
- **Mobile/embedded integration:** https://github.com/amerhwitat/general
- **CPU research:** https://github.com/amerhwitat/CPU4096
- **CPU simulator:** https://github.com/amerhwitat/CPU4096Simulator
- **Python integration:** https://github.com/amerhwitat/test
- **Java track:** https://github.com/amerhwitat/keygen
- **NLP:** https://github.com/amerhwitat/nlp
- **PDF research:** https://github.com/amerhwitat/PDFreaderPY
- **Crypto research:** https://github.com/amerhwitat/eth-key-check and https://github.com/amerhwitat/bruteforce
- **Graphics/application tracks:** https://github.com/amerhwitat/BizX and https://github.com/amerhwitat/BizXtreme

## Portfolio-wide 128D + authenticated P2P

The website documents the common semantic model and peer protocol used across the portfolio. The 128D layer represents geometry, time, observer/perspective, light/material response, events, objects, properties and interaction rules, with extensible perception/cognition/vector dimensions. P2P is opt-in, authenticated and capability-aware, using deterministic envelopes, payload hashes and replay-resistant sequencing.

The protocol does not authorize unsolicited scanning, credential/private-key exchange, arbitrary executable transfer or remote command execution.

## Source-of-truth rule

The canonical Chimera II OS implementation is maintained in `amerhwitat/ChimeraIIOS`. This website repository provides discovery and documentation surfaces rather than replacing the canonical source tree.

## Licensing

Original website and project documentation code is GPLv3-or-later where compatible. Third-party libraries, fonts, assets and generated external content retain their applicable licenses.


## Cross-edition Mobile and ISO/Flash release status

The public site, ChimeraIIOS, and OctavianOS share a release-evidence contract, but each target is tracked independently. A catalog entry, successful component compile, image checksum, or candidate probe is not proof of a bootable production system.

- **Mobile edition:** architecture/device-specific builds and runtime checks are required for boot, touch/input, display, audio, storage, settings persistence, services, and desktop/session routing. Do not infer mobile readiness from x86_64 BIOS/UEFI results.
- **ISO/Flash Center:** retain non-destructive image inspection and checksum verification separately from destructive writes. Flashing requires explicit confirmation (`CHIMERA_FLASH_CONFIRM=YES`), a validated image, an explicit `/dev/...` target, and post-write verification. Never run physical-device writes in CI or accept arbitrary shell commands.
- **Production OS gate:** all six Live/Installer/Recovery × BIOS/UEFI runs must show genuine CPL3-originated syscalls and PID-bound readiness, followed by evidence for VFS/file operations, persistent storage, install/reboot, Recovery repair, Aurora handoff, functional preferences/providers, and AP-backed concurrency.
- **Current engineering records:** [OctavianOS production handoff status](https://github.com/amerhwitat/OctavianOS/blob/feat/cross-os-settings-driver-compat-20261022/docs/PRODUCTION_USERSPACE_HANDOFF.md) · [ChimeraIIOS native-init integration status](https://github.com/amerhwitat/ChimeraIIOS/blob/feat/cross-os-settings-driver-compat-20261022/docs/NATIVE_INIT_INTEGRATION_STATUS.md).

These are tracked acceptance requirements, not a declaration that the gates have passed. Keep release/publishing gates closed until matching runtime evidence is attached.


### Latest flash safety changes — 2026-10-22

- ChimeraIIOS native writer: [c70f7d82](https://github.com/amerhwitat/ChimeraIIOS/commit/c70f7d82c7bfae232a9067636f7f8088d843f1dd) now requires a verified expected digest, whole-disk block device, no mounted filesystems, explicit confirmation, and post-write read-back verification.
- OctavianOS vendored native writer: [f5bc18bd](https://github.com/amerhwitat/OctavianOS/commit/f5bc18bdd24e1ae7ab76b0b26182c7ba37307170) applies the mounted/non-disk target guard; its earlier writer/bridge changes are recorded in the cross-edition PR discussion.
- Flash Center UI checksum preflight: [85c7550e](https://github.com/amerhwitat/amerhwitat.github.io/commit/85c7550ee2795c29d2afa77fe3c96e74b069dbcf) and follow-up Mobile evidence link fix [0f6b0478](https://github.com/amerhwitat/amerhwitat.github.io/commit/0f6b04787e3af0e2358f70449b3fc5d15e9689d4).

These are source changes, not proof of a successful real-device flash. The previous Mobile and production matrix runs were cancelled, so reruns and runtime evidence remain required before publication is treated as verified.


## Interactive landing page refresh — 2026-10-22

The portfolio homepage now includes a responsive Aurora-inspired glass hero, direct workspace launch links, a searchable keyboard-driven Quick Launch palette (Ctrl/⌘+K), and a persistent light/dark appearance toggle. The design respects reduced-motion preferences and includes Open Graph/social preview metadata.

- Homepage: https://amerhwitat.github.io/
- Landing styles: [landing-studio.css](landing-studio.css)
- Landing interactions: [landing-studio.js](landing-studio.js)
- Page entry: [index.html](index.html)
- Pages workflow and link/catalog checks: [.github/workflows/pages.yml](.github/workflows/pages.yml)

The source and workflow checks are committed; treat live deployment and browser-level acceptance as pending until the Pages run and deployed site are independently verified.
