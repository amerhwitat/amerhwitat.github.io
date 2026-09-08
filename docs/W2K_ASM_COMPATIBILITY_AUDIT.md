# W2K-ASM Compatibility Audit

## Purpose

`W2K-ASM.txt` is treated as a historical compatibility-analysis corpus. Chimera II does **not** redistribute or copy Microsoft proprietary source from that corpus. The native implementation uses derived interface requirements, behavioral descriptions, and clean-room tests.

## Findings

The corpus identifies compatibility requirements in several families:

- x86 32-bit instruction execution and effective-address decoding
- Alpha and PowerPC execution/thunk boundaries
- NT-style calling-convention and procedure glue
- TEB/FS-based thread-local access
- critical sections with ownership, recursion, atomic lock operations, spinning and wait paths
- exception/unwind and dispatch mechanisms
- floating-point instruction emulation and dispatch tables
- PE/COFF and loader-facing structures
- lock-prefix/atomic instruction metadata
- low-level memory and synchronization primitives

The critical-section material explicitly uses atomic increment/CMPXCHG, owner identity, recursion counts, spin counts and wait paths. These requirements map to the native `ChimeraSynchronization` boundary rather than copying implementation code.

## Native gap matrix

| W2K/NT concept | Chimera II native target | Status |
|---|---|---|
| x86 integer execution | `Cpu` + x86-64 ASM | Partial |
| x86 effective addresses | ISA decoder extension | Planned |
| TEB/FS/GS access | platform thread-context adapter | Planned |
| critical sections | native synchronization adapter | Planned |
| atomic lock prefix | C++ atomics / ASM primitives | Partial |
| recursive ownership | synchronization adapter | Planned |
| spin/wait behavior | scheduler adapter | Planned |
| exception dispatch | native exception boundary | Planned |
| FP emulator | numeric compatibility module | Planned |
| PE/COFF loading | Windows loader adapter | Planned |
| Alpha/PPC compatibility | translation/emulation boundary | Catalogued |
| NT system-call surface | Windows compatibility ABI | Catalogued |

## Compatibility policy

The goal is behavioral interoperability with supported Windows generations and applications, not reproduction of Microsoft's historical implementation. Host-specific mechanisms are selected at runtime. Windows-native execution can use Win32/NT facilities; Linux/WSL execution uses POSIX/Linux facilities.

## Next implementation boundary

The remaining work should be implemented as clean-room C/C++ interfaces with tests for observable behavior: synchronization ordering, recursion, thread ownership, exception propagation, loader metadata, calling conventions, 32-bit compatibility, and filesystem/network semantics.
