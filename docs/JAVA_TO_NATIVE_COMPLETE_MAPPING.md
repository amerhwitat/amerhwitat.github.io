# Java 25 → Native ASM/C/C++ Mapping

The Java repository remains the semantic reference. This document records the native counterpart of the features developed there.

| Java feature | Native counterpart |
|---|---|
| Register8192 | `chimera_reg8192_t` (128 × 64-bit lanes) |
| Instruction | `chimera_instruction_t` + `Cpu::encode/decode` |
| ChimeraCpu | `chimera::Cpu` |
| ADD/SUB/AND/OR/XOR/NOT/MOV | native ISA execution |
| shifts/rotates | native ISA execution |
| MUL/MULHI | native ISA execution |
| DIV/REM | native ISA execution |
| CMP/CMPEQ/CMPLT | native ISA execution |
| SYS_CALL/BARRIER/POLICY_UPDATE | privilege-gated native execution |
| Vector128D | `koronos.cpp` vector primitives |
| KoronosRnn128 | `koronos.cpp` learning primitive boundary |
| KoronosKernel | native runtime/kernel boundary |
| KernelDataStore/H2 | host persistence adapter boundary |
| DesktopProfileRegistry | desktop catalog/profile layer |
| DesktopCapabilityDetector | platform compatibility catalog |
| SpitfireBootProgress | desktop/boot progress subsystem |
| DesktopLoadingProgress | desktop progress subsystem |
| BootDesktopProgressCoordinator | boot-to-desktop coordinator |
| LinuxRuntimeCatalog | runtime catalog |
| FileSystemCatalog | filesystem catalog |
| NetworkScannerCatalog | network capability catalog |
| WindowsCompatibilityCatalog | Microsoft/Windows capability catalog |
| GnuPlatformCatalog | GNU utility/service catalog |
| OpenSourceApplicationCatalog | open-source application catalog |
| TrustedChimeraNode | federation boundary |
| ChimeraTrustStore | native trust-store boundary |
| ChimeraNodeMessage | native message representation |
| KoronosConcurrency | native concurrency boundary |

## ABI rule

The native port preserves the 8192-bit register representation and 16-byte canonical instruction layout. It does not attempt to reproduce Java runtime implementation details such as Jakarta REST, H2 internals, DJL internals or Java virtual threads. Those become portable subsystem contracts backed by the host platform.

## ISA scope

The native CPU currently implements the semantic operations needed by the current Java CPU subset and retains the architecture's wider opcode namespace as an extension point. It should not be described as a complete implementation of all 284 native ISA opcodes until generated opcode tables and conformance tests cover every opcode.

## Security

Privilege checks are enforced for the native system-call and policy-update boundaries. Process launchers must continue to reject shell metacharacter injection and use structured argument vectors.
