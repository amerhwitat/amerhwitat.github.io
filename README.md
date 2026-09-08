# Chimera II OS — Native ASM/C/C++ Track

This repository is the additive native integration track derived from the Java 25 implementation in `amerhwitat/keygen`.

**Protected repositories:** `amerhwitat/ChimeraIIOS` and `amerhwitat/test` are intentionally untouched by this project.

## Architecture

- 8192-bit register model: 128 × 64-bit lanes, 1024 architectural registers.
- 16-byte canonical instruction representation.
- Expanded native semantic ISA: arithmetic, logic, shifts, rotates, multiply/high-multiply, divide/remainder, comparisons and privilege-gated system boundaries.
- x86-64 NASM helpers with optional assembly build.
- Koronos 128D vector/learning primitives.
- Spitfire boot progress and desktop-loading coordination.
- Runtime, filesystem, network, GNU and open-source application catalogs.
- Linux kernel ABI capability catalog.
- Microsoft/Windows open-source compatibility catalog including WSL/WSL2, WSLg, PowerShell, OpenSSH, Windows Terminal/ConPTY, WinGet, PowerToys and cross-platform coreutils.
- Cross-platform command and utility catalog spanning Linux, Unix, Windows and WSL.
- Trusted-node, concurrency and federation boundaries.
- C ABI for embedding from other runtimes.
- CMake + Linux/Windows CI verification.

## W2K-ASM compatibility

The supplied historical `W2K-ASM.txt` corpus is used as a compatibility-analysis source. Its behavioral requirements are translated into clean-room interfaces and conformance targets; proprietary Microsoft source is not copied into this repository. See `docs/W2K_ASM_COMPATIBILITY_AUDIT.md`.

## Java-to-native coverage

`docs/JAVA_TO_NATIVE_COMPLETE_MAPPING.md` maps the Java implementation features discussed during development to their native counterparts. Java-specific Jakarta REST, H2, DJL and virtual-thread internals are represented as host-neutral native subsystem contracts rather than line-for-line runtime copies.

## Build

```bash
cmake -S . -B build
cmake --build build
ctest --test-dir build --output-on-failure
```

NASM is optional. If unavailable, the portable C/C++ implementation still builds.

## Documentation

- `docs/JAVA_TO_NATIVE_MIGRATION.md`
- `docs/JAVA_TO_NATIVE_COMPLETE_MAPPING.md`
- `docs/LINUX_KERNEL_COMPATIBILITY.md`
- `docs/MICROSOFT_OPEN_SOURCE_STACK.md`
- `docs/COMMAND_UTILITY_COMPATIBILITY.md`
- `docs/W2K_ASM_COMPATIBILITY_AUDIT.md`
- `docs/BOOT_AND_DESKTOP_LOADING_PROGRESS.md`
- `docs/CROSS_PLATFORM_COMPATIBILITY.md`
- `docs/GNU_CROSS_PLATFORM_SERVICES.md`
- `docs/OPEN_SOURCE_APPLICATIONS_RESEARCH.md`
- `docs/LICENSING.md`

## Source-of-truth rule

The Java track remains the semantic migration reference. Native code preserves the intended ABI/ISA contracts while using host adapters for operating-system facilities. The native CPU must not be described as a complete implementation of all 284 ISA opcodes until generated opcode tables and full conformance tests cover them.
