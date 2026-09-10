# Linux Commands Source Integration

The Chimera II project uses GNU Coreutils, util-linux, iproute2/net-tools, sudo, POSIX shells, and Toybox as documented upstream reference families. Preserve upstream licenses/SPDX metadata and implement integrations through explicit adapters.

The web-facing implementation is designed around a shared command registry and isolated terminal sessions, while the standalone implementation targets native Chimera userland.

Performance policy: bounded concurrency, asynchronous I/O, batching, and deterministic serial fallbacks.

Canonical registry: `amerhwitat/ChimeraIIOS`.
