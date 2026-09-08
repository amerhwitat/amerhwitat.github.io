# Linux Kernel Compatibility

Chimera II exposes a host-neutral kernel boundary rather than embedding the Linux kernel into the repository. The catalog follows stable Linux userspace concepts and maps them to native C/C++ adapters.

## Kernel interfaces

- system calls and architecture-specific syscall tables
- VFS and file descriptors
- virtual memory and memory mapping
- process/thread primitives
- epoll, eventfd and signal/event interfaces
- netlink and sockets
- namespaces and cgroups when available
- seccomp when available
- `/proc`, `/sys`, `/dev`
- io_uring when available

Linux documents the syscall interface as a stable userspace ABI, while architecture-specific syscall numbering remains host dependent. Chimera therefore records capability IDs instead of hard-coding Linux syscall numbers into the portable core.

## Design

`PlatformCompatibilityCatalog::linux_kernel()` provides capability discovery. A future `LinuxKernelAdapter` can bind those capabilities to host syscalls without changing the Chimera ISA or ABI.

## Compatibility rule

Never call Linux syscall entry functions as if they were ordinary kernel-internal helpers. The native boundary follows Linux's userspace/kernel separation and keeps host-specific syscall wrappers outside the semantic CPU core.
