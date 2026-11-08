# Koronos Linux-style boot and X.Org desktop integration

This page describes the boot pipeline and desktop server boundaries. It follows the current Linux boot protocol, initramfs, systemd bootup and X.Org architecture references; it does not claim that Koronos implements Linux ABI compatibility.

## Linux-style boot stages

1. BIOS/UEFI firmware and platform discovery.
2. Spit Fire architecture bootstrap.
3. Jasper boot policy and interactive Gates/GRUB2 menu.
4. Kernel entry and validated CHMBOOT1/Multiboot2 handoff.
5. Early console, physical memory map, frame allocator and address spaces.
6. CPIO newc initramfs validation and read-only Koronos VFS.
7. CPU/PCI/ACPI/SMBIOS discovery and driver probing.
8. Scheduler, ring-3 process admission and target init ELF.
9. Kore service orchestration, Spotnik networking, Nucleus/Hive/Aegis.
10. Display server, compositor, desktop session, terminal and applications.

The Jasper/Gates/GRUB menus use a visible 300-second timeout before selecting the default entry.

## Windows startup comparison

Microsoft documents Windows startup as PreBoot/UEFI → Windows Boot Manager/BCD → OS Loader (winload.exe/winload.efi) → NT kernel → Session Manager (Smss.exe) → services and user session. Koronos maps these roles conceptually to firmware/Spit Fire → Jasper/Gates/GRUB2 → Koronos kernel and driver bootstrap → Kore and the selected ring-3 target → Aurora session. These are architectural analogies only: Koronos does not implement the Windows kernel ABI, BCD, PE loader or Windows driver model.

Reference: [Microsoft Windows startup phases](https://learn.microsoft.com/windows/client-management/advanced-troubleshooting-boot-problems) and [Windows 11 Secure Boot / Trusted Boot](https://learn.microsoft.com/en-us/windows/security/operating-system-security/system-security/trusted-boot).

## Koronos status and boundaries

The x86-64 boot path validates its Multiboot2 boot context, scans modules, initializes memory/address-space subsystems, registers drivers and bootstrap services, and can launch an explicit ring-3 target ELF after initramfs validation.

The CPIO VFS is currently read-only. Koronos does not yet execute the shell-script /init from CPIO, perform a generic switch-root, provide a complete writable root filesystem, or deliver a production PID-1 service manager. The live, installer and recovery targets are still acceptance-gated. The installer disk-writing backend is not production-ready.

Koronos is currently an x86-64 kernel implementation. Cross-built Linux command binaries for AArch64, RV64 and other ABIs do not make those architectures bootable Koronos ports.

## X.Org and Aurora desktop

The hosted Chimera II OS and OctavianOS Linux desktop images package X.Org, Xwayland, xinit and video drivers. The new X11 session manager discovers installed XDG sessions under /usr/share/xsessions and /usr/local/share/xsessions.

Use:

- `chimera-xserver-session list` to list installed X11 desktop sessions.
- `chimera-xserver-session start chimera-aurora-x11` to start Aurora through X.Org.
- The Aurora X11 fallback runs Openbox and the Aurora WebKit kiosk.
- Wayland sessions remain owned by their compositor; Xwayland serves X11 clients inside Wayland sessions.

This uses the upstream X.Org server on Linux. It is not a custom X server inside the freestanding Koronos kernel. A native Koronos X server still needs production framebuffer/DRM, input, IPC and socket interfaces.

## Commands, ISA, terminals and artwork

The command and ISA catalogues are shipped as reference data with implementation/provider coverage reports. A catalogue entry is not proof of a binary or instruction backend. Each command must resolve to a real native implementation or verified provider; each ISA instruction must have semantics and conformance tests. The current native multicall covers only a subset of the catalogue, and the remainder are not to be represented as completed by placeholder files.

The hosted desktop builder installs open-source shells and terminals from the Aurora registries, verifies target architecture and executable format, performs smoke tests, and emits launchers only for verified binaries. The Aurora app artwork sprite, generated icons, boot artwork and sound assets are included in the hosted editions.

## Current release gates

- Full command provider coverage with actual binaries and smoke tests.
- Complete ISA semantics, encoders/decoders and execution conformance for advertised families.
- Native Koronos initramfs /init execution and full service manager.
- Writable VFS, real installer, recovery and rollback.
- Native display/input/graphics stack and Aurora compositor.
- Per-architecture QEMU and hardware runtime acceptance.

## Upstream technical references

- [Linux x86 boot protocol](https://docs.kernel.org/arch/x86/boot.html)
- [Linux EFI boot stub](https://docs.kernel.org/admin-guide/efi-stub.html)
- [systemd 261 bootup and initrd stages](https://www.freedesktop.org/software/systemd/man/261/bootup.html)
- [X.Org documentation](https://www.x.org/Documentation/)
- [X Window System client/server concepts](https://www.x.org/guide/concepts/)
