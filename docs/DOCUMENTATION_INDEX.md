# Chimera II Native Documentation Index

## Architecture
- `JAVA_TO_NATIVE_MIGRATION.md` — initial migration model
- `JAVA_TO_NATIVE_COMPLETE_MAPPING.md` — Java 25 feature mapping
- `W2K_ASM_COMPATIBILITY_AUDIT.md` — clean-room Windows/NT compatibility audit

## Operating-system compatibility
- `LINUX_KERNEL_COMPATIBILITY.md` — Linux kernel/userspace ABI boundary
- `MICROSOFT_OPEN_SOURCE_STACK.md` — Microsoft open-source interoperability providers
- `COMMAND_UTILITY_COMPATIBILITY.md` — shells, commands and utilities
- `CROSS_PLATFORM_COMPATIBILITY.md` — Windows/Linux/Unix/macOS catalog

## Runtime and applications
- `GNU_CROSS_PLATFORM_SERVICES.md`
- `OPEN_SOURCE_APPLICATIONS_RESEARCH.md`
- `KORONOS_DISTRIBUTED_RUNTIME.md`
- `KERNEL_LEARNING_DATABASE.md`

## Desktop and boot
- `BOOT_AND_DESKTOP_LOADING_PROGRESS.md`

## Legal/provenance
- `LICENSING.md`

## Verification

Native CI builds the C/C++ track on Ubuntu and Windows and runs the native self-tests. NASM remains optional so the portable C/C++ implementation can be verified without an assembler dependency.
