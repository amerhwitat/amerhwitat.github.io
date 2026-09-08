# Java → ASM/C/C++ migration

The native track in this repository mirrors the implemented Java track in `amerhwitat/keygen` without changing the original ChimeraIIOS repository.

## Mapping

| Java track | Native track |
|---|---|
| Register8192 | `chimera_reg8192_t` / `Cpu::r` |
| Instruction | `chimera_instruction_t` |
| ChimeraCpu | `chimera::Cpu` |
| Vector128D | `chimera::Vector128D` |
| KoronosRnn128 | `chimera::KoronosRnn128` |
| SpitfireBootProgress | `SpitfireBootProgress` |
| DesktopLoadingProgress | `DesktopLoadingProgress` |
| BootDesktopProgressCoordinator | native coordinator |
| Linux/runtime catalogs | `Catalog` native tables |
| trusted-node message boundary | `SignedMessage` + native adapter boundary |

## Compatibility boundary

Java-specific Jakarta REST, H2, DJL, virtual-thread and `ProcessBuilder` mechanisms are represented as native subsystem boundaries rather than falsely translated line-for-line. Host OS integration remains delegated to the native operating system.

## ISA preservation

The canonical instruction is 16 bytes: opcode, destination, source A, source B and 64-bit immediate. The 8192-bit register is 128 little-endian 64-bit lanes. The native implementation currently covers the semantic subset implemented by the Java CPU and explicitly rejects unsupported opcodes.

## Source protection

No files are copied back into `amerhwitat/ChimeraIIOS`. This repository is a separate additive native track. The supplied W2K-ASM material remains provenance metadata only; proprietary Microsoft corpus is not redistributed here.
