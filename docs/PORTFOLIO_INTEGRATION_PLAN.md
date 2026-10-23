# Portfolio integration plan — 2026-10-23

## Source inventory
Repositories identified in the current owner search: amerhwitat.github.io, ChimeraIIOS, OctavianOS, BizX, BizXtreme, CPU4096, CPU4096Simulator, nlp, PDFreaderPY, keygen, bruteforce, eth-key-check, general, test, and private VanG. This is the current search result, not a guarantee the account has no other repositories.

## Framework selection
- Keep existing static HTML/CSS/JavaScript pages working; avoid a risky framework rewrite of the entire site.
- Prefer React + TypeScript + Vite for new interactive browser tools, client-heavy dashboards and WebGL wrappers. This suits static GitHub Pages and a simple production build.
- Use Next.js when server rendering, server routes or richer content workflows are needed. Static export supports only compatible features.
- Use Angular or Vue when a specific project constraint makes them the best fit; do not duplicate every app in every framework.
- Use native WebGL or a library/engine such as Three.js for desktop effects, with resize handling and fallback behavior.

## Porting contract
Track each source project with source URL, license, language/framework, dependencies, browser-port strategy, feature parity, test command, accessibility/security checks and deployment URL. Classify features as ported, partial, blocked or native-only. A catalog entry is not evidence of conversion completion.
- C/C++/ASM kernel and drivers: expose diagnostics, architecture visualizers, configuration tools and simulators in-browser where meaningful; do not claim a browser page replaces bare-metal execution.
- Python/Java GUI: separate portable logic from native UI and dependencies; port where license and dependencies allow.
- React Native/mobile: reuse compatible business logic selectively; native permissions, hardware APIs, packaging and signing remain separate.
- WebGL/Unity: preserve runtime assets and paths, validate MIME/content-encoding, and smoke-test loading/fullscreen/console errors. The supplied build uses gzip-compressed files that need suitable server headers or Unity decompression fallback.

## Plan / Do / Check / Act
1. Plan: discover repositories, current website catalog and CI; map source features to existing pages and gaps.
2. Do: add a central navigation/control page, a WebGL launch wrapper and searchable repository inventory without deleting routes.
3. Check: validate HTML/JS syntax, index JSON, links, responsive layout, WebGL fallback and Pages workflow. Test Unity only after binary assets are published.
4. Act: merge only after review and CI. Verify live URL and deployment commit; retain blocked items and never report unexecuted tests as passing.

## Outstanding gates
- The Unity archive's payload is about 7.9 MB uncompressed. This pass inspected it and created a launcher/asset contract, but binary assets have not been copied into the website repository; Unity launch and publication are therefore incomplete.
- OS production userspace acceptance is independent of web UI readiness. Previous recorded CPL3 init acknowledgement failures must not be overridden by a static site build.
- Public discovery does not grant redistribution rights for proprietary binaries, firmware, ROMs, credentials or third-party code. Check licenses and attribution.
- The live website is not updated until the PR is merged and Pages deployment is verified.
