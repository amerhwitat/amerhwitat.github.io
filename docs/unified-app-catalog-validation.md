# Unified application catalog validation

This directory's catalog gate is intended to validate:
- Unique application IDs in the Aurora launcher registry.
- Required title, runtime mode, and launch target fields.
- Existence of local launch targets and rejection of paths escaping the repository.
- Unique paths and required titles in the hosted search index.

Catalog checks are not proof of application runtime correctness. Browser previews are not native Koronos executables. A source repository or project listing must not be classified as installed, ported, or executable without target-specific evidence.

Current source inputs:
- `apps/chimera-ii-os/web/aurora_apps.json` (schema `chimera-aurora-apps/v13`)
- `apps/chimera-ii-os/web/aurora-ecosystem-catalog.json` (schema `aurora-ecosystem-catalog/v1`)
- `search-index.json`

The repository's existing catalog checks should be retained; this plan adds duplicate-ID and launcher-target validation and should be wired into both pull-request validation and the publish workflow.
