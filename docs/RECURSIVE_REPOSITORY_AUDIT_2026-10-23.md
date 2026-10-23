# Recursive repository inventory and feature parity — 2026-10-23

## Method and limitations
Queried GitHub recursive Git trees on the default branches. Counts are tracked blob entries, not unique source files across repositories; vendor mirrors, generated outputs, backups, and duplicated code are included. This pass counted extensions, HTML pages, workflow/manifests and identified README/LICENSE paths. It did not read every file or resolve every dependency tree. A license file's existence does not by itself establish that every bundled asset is redistributable.

| Repository | Tracked blob entries | HTML pages | Manifest / README / license / workflow-like paths found | Initial parity assessment |
|---|---:|---:|---:|---|
| amerhwitat.github.io | 714 | 112 | 31 | Existing static portfolio, app catalog and CI; new integration and WebGL launcher on PR branch |
| ChimeraIIOS | 2,641 | 26 | 245 | Kernel + userspace + desktops; native acceptance gated |
| OctavianOS | 2,654 | 30 | 270 | Kernel + imported source + desktops; native acceptance gated |
| BizX | 553 | 7 | 73 | Several existing browser surfaces; validate GUI/API parity |
| BizXtreme | 384 | 5 | 59 | Browser/Three.js surfaces; validate route and CORS behavior |
| CPU4096 | 74 | 3 | 15 | Browser implementation candidate; compare to canonical instruction fixtures |
| CPU4096Simulator | 123 | 8 | 16 | Multiple browser pages plus JavaFX source; simulator parity tests needed |
| nlp | 606 | 7 | 68 | NLP, language/RTL and scanner browser surfaces |
| PDFreaderPY | 70 | 2 | 18 | Browser reader and export need implementation/runtime tests |
| keygen | 137 | 2 | 15 | Security-sensitive; local-only operations and threat-model review |
| bruteforce | 69 | 2 | 16 | Restricted to safe, bounded defensive research experiences |
| eth-key-check | 94 | 2 | 15 | Private-key isolation and local-only processing required |
| general | 570 | 11 | 83 | Many nested tools; bridge/API auth and CORS review required |
| test | 126 | 4 | 16 | Distinguish maintained demos from fixtures |
| VanG (private) | 22 | 0 | 6 | Metadata-only inventory; no public redistribution without permission |

The tree scan returned 10,851 entries across these 15 repositories, including vendor and generated files. A complete dependency/license audit still requires reading the manifests and license files per subproject and tracing nested dependencies.

## Project-by-project parity contract
The live interactive matrix is at `/apps/repository-feature-parity/`. It includes a searchable filter and CSV export. Treat its rows as backlog classification, not completed port evidence.

For each app, add a row in the follow-on audit with:
- exact source path and owning repository commit;
- license and redistribution permission for code, assets, models and data;
- language, framework, manifests, pinned dependencies and security advisories;
- current browser entry point and reachable route;
- native-only dependencies, hardware APIs, filesystem access, and service endpoints;
- feature parity checklist with each item `ported`, `partial`, `blocked`, or `native-only`;
- build/test command, browser smoke test, accessibility and security results;
- deployed URL and deployment commit SHA.

## Root-cause and acceptance gates for ChimeraIIOS / OctavianOS
Do not close the native release based on source checks or the web desktop. Require:
1. kernel build + linker/map checks;
2. archive parser fuzz/negative tests and transactional RAMFS rollback coverage;
3. ELF PT_LOAD/BSS/permissions and process-owned address-space tests;
4. real CPL3 launch and syscall acknowledgement from the actual target init process, not hard-coded PID or a kernel-authored readiness marker;
5. required services reach healthy states or report a bounded, explicit failure;
6. pager fault/wait/wake and scheduler dispatch/idle paths are real and deadlock-tested;
7. storage device selection is validated against enumerated devices and partition/filesystem bounds, never blindly trusted from caller input;
8. Live, Installer and Recovery each prove target-specific userspace readiness;
9. BIOS and UEFI runs for each target, with captured logs/artifacts;
10. Aurora handoff and actual AP startup/per-CPU scheduler evidence.

The current repository scan does not prove these gates passed. Earlier engineering context identified unresolved production userspace handoff and genuine SMP acceptance; keep these NOT VERIFIED until fresh evidence proves otherwise.

## Unity WebGL asset publication
The supplied archive at `webgl.zip` contains 19 ZIP entries under `webgl/webgl/`, including:
- `Build/webgl.loader.js` (7,791 bytes)
- `Build/webgl.data.gz` (2,751,558 bytes)
- `Build/webgl.framework.js.gz` (89,753 bytes)
- `Build/webgl.wasm.gz` (5,065,670 bytes)
- `TemplateData/` images and CSS.

The launch page is `/apps/webgl-unity/`. The archive is available in the current conversation runtime, but the GitHub repository connector only accepts UTF-8 text content for normal file creation; it cannot directly transfer these binary bytes from this chat's mounted file. Therefore the binary payload is NOT published by this change. Upload the extracted directory via a trusted Git checkout/CI artifact path, then verify correct MIME and Content-Encoding headers, successful player load, fullscreen, and zero console errors. Never claim the Unity build is live until that browser test passes.

## Plan / Do / Check / Act loop
- PLAN: inventory repositories, source trees, manifests, workflows, browser surfaces and native acceptance blockers.
- DO: maintain integration pages and per-repo matrix; port a discrete app at a time with a tested feature contract.
- CHECK: run site catalog tests and per-project CI; inspect failures/logs; verify live routes and release artifacts.
- ACT: fix the specific root cause, rerun the same failing test plus regression tests, and update status only from new evidence.

Stop/release rule: no merge or release claim while relevant checks are failed, queued, or missing. Passing website CI is independent from native OS acceptance.
