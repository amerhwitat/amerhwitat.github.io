# Portfolio-wide GUI migration and desktop evolution

Status date: 2026-10-19. This document defines a staged implementation contract; it does not claim every repository has already been converted or published.

## Desktop scope

Preserve the product identities **Aurora Wayland Glass Desktop** and **Marine Desktop**. Build configurable, original interfaces inspired by broad desktop interaction patterns across Windows 3.1/3.11, 95/98/Me, NT/2000/XP, Vista/7, 8/8.1, 10 and 11, and announced/future Windows 12-era concepts where verifiable. Do not copy proprietary source, assets, icons, or trade dress. Treat Windows 12-specific claims as unverified unless confirmed by authoritative public evidence.

Feature families to assess: app launcher and grouped program navigation; file manager and associations; taskbar and notification area; task switching and previews; themes and accessibility; window snapping and virtual desktops; compositing/transparency; widgets and quick settings; touch/pen/voice; multi-monitor and high-DPI; app permissions; update, recovery and diagnostics; search/command palette; consent-based assistant integration.

The static prototype at [apps/desktop-evolution/](../apps/desktop-evolution/) is an interactive feature-selection tool. Its choices are planning data, not an implementation claim.

## Web technology strategy

- **Angular + TypeScript:** use for componentized client-side applications with substantial interactive state.
- **Next.js + TypeScript:** use where file-based routing, server rendering, or API routes are useful. For GitHub Pages, configure static export and remove server-only dependencies from the published route.
- **Java/Spring Boot:** implement server APIs, domain services and integrations where hosting a JVM service is available. GitHub Pages cannot execute Spring Boot; publish a static browser client and document the separately hosted API endpoint.
- **JavaFX/Swing:** retain a native desktop distribution where appropriate. A browser GUI must be a deliberate web port or a browser client to a documented API; JavaFX source is not directly executable in ordinary browsers.
- **Python:** inventory dependencies and entry points, then port the interface to web technologies or expose a narrowly scoped service API. Do not run arbitrary repository code in the browser or on a public server.
- **Native Java/C/C++/other code:** build and test in its native toolchain; provide a web GUI only through a verified port, WebAssembly build, or documented service bridge.

Do not force every project into every framework. Select the least complex architecture that supports the project's actual behavior, licensing, dependencies, and runtime.

## Migration workflow

1. Enumerate public repositories and default branches; record language, entry points, licenses, existing UI, assets, tests, dependencies and build instructions. Mark private, inaccessible, truncated and rate-limited scans as incomplete.
2. Classify each project: existing web UI, JavaFX/Swing GUI, Python GUI/CLI, native application, library, OS/kernel or documentation-only.
3. Add a project card and canonical source link to the portfolio catalog. Do not label a source-only project as a working GUI.
4. For each port, preserve core workflows and data formats; create a separate implementation directory and a migration note linking to the source.
5. Add project-specific lint, tests, accessibility checks, dependency/license review and production build checks. Keep generated assets and vendored dependencies out of catalogs where possible.
6. Validate search-index/catalog consistency, all local links, browser behavior and GitHub Pages deployment. Check the deployed URL after the workflow completes.
7. For Aurora/Marine native desktop integrations, require compositor/runtime evidence separately from web-prototype screenshots.

## Acceptance labels

- **Inventoried:** source tree inspected; completeness and limitations recorded.
- **Prototype:** GUI renders and basic interactions work; backend or original program behavior may be absent.
- **Ported:** key workflows are implemented and tests cover them.
- **Build verified:** reproducible build passed on a named toolchain.
- **Published:** Pages deployment succeeded and the deployed URL was checked.
- **Native verified:** native runtime behavior demonstrated separately.
- **Not verified:** missing evidence; never infer success from a catalog entry or compile-only check.

## Current known project tracks

Previously identified portfolio tracks include ChimeraIIOS, OctavianOS, CPU4096, CPU4096Simulator, PDFreaderPY, NLP, BizX, BizXtreme, and other repositories linked from the portfolio README. Prior work included JavaFX implementations for PDFreaderPY and CPU4096Simulator, but this does not mean all repository code has a web port or that all Pages deployments are live. Re-inventory the current default branches before claiming completeness.

## Deployment boundaries

The public portfolio is the discovery and static web delivery layer. Native operating-system code, JavaFX desktop apps, Python environments, and Spring Boot services require separate compatible runtimes. Never publish credentials, signing keys, tokens, private data, or unreviewed executable uploads. Never replace a real runtime acceptance test with a synthetic success marker.
