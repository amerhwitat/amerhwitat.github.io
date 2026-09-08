# Chimera II OS — Native ASM/C/C++ Track

This repository is the native translation/integration track derived from the Java 25 implementation in `amerhwitat/keygen`.

**The original `amerhwitat/ChimeraIIOS` repository is intentionally untouched.** This repository is additive and provides native C, C++, and architecture-specific assembly implementations plus compatibility catalogs and migration documentation.

## Scope
- 8192-bit register model: 128 × 64-bit lanes.
- 16-byte canonical instruction representation.
- Native semantic CPU subset corresponding to the current Java implementation.
- Native Spitfire boot progress and desktop loading coordinator.
- Koronos 128D vector/cognition primitives.
- Runtime, filesystem, network, GNU, Windows, macOS and open-source application catalogs.
- Trusted-node message primitives and process orchestration boundaries.
- C ABI for embedding from other runtimes.
- CMake build with optional NASM/architecture-specific assembly.

This is a source-level native port, not a claim that every Java/Jakarta/H2/DJL dependency has a binary-equivalent native implementation. Native adapters are provided where the Java implementation delegates to host facilities.

## Source of truth
The Java track remains the semantic migration reference. Native code is designed to preserve its ABI/ISA intent while remaining independently buildable.

## Build
```bash
cmake -S . -B build
cmake --build build
ctest --test-dir build --output-on-failure
```

The repository does not alter or vendor the original ChimeraIIOS repository.
