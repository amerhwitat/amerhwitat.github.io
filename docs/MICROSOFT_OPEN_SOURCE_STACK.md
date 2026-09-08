# Microsoft Open-Source and Windows Compatibility Stack

The native Chimera II track integrates Microsoft open-source projects as **capability providers**, not as vendored operating-system binaries.

## Catalogued providers

- Windows Subsystem for Linux (WSL/WSL2)
- WSLg
- **PowerShell 7+ for Linux, Windows and macOS**
- OpenSSH / Win32-OpenSSH
- Windows Terminal / console infrastructure
- ConPTY
- WinGet
- WinGet Community Repository metadata
- Microsoft PowerToys
- Microsoft Coreutils for Windows (uutils/coreutils + findutils + grep)
- WindowsDeveloperConfig

## PowerShell on Linux

PowerShell 7+ is the preferred Microsoft shell integration for Chimera. The upstream PowerShell project describes itself as cross-platform for Windows, Linux and macOS, provides a shell plus scripting language and cmdlet framework, and is MIT-licensed. Chimera therefore exposes `pwsh` independently of the legacy Windows PowerShell 5.1 compatibility boundary.

Recommended provider resolution:

1. Native `pwsh` on Linux when installed.
2. `pwsh` supplied by the host package/runtime manager.
3. PowerShell inside WSL when policy selects WSL isolation.
4. Native Windows PowerShell only as a legacy Windows compatibility provider.

Chimera should never assume that a Windows-only PowerShell executable exists on Linux.

## Integration model

`Microsoft provider -> capability catalog -> Chimera compatibility ABI -> host adapter`

This allows Chimera to discover and invoke facilities when the host provides them while retaining Linux/Unix alternatives.

## Coreutils for Windows

Microsoft's `coreutils` repository describes a native Windows multi-call package based on uutils/coreutils, findutils and grep. Chimera exposes this as `coreutils-windows` and can select it when Windows-native command compatibility is preferred.

## WinGet

WinGet is represented as a package-manager capability. Chimera should consume package metadata through an adapter instead of embedding the client.

## WSL

WSL is a particularly important bridge: Windows can execute Linux commands and Linux environments can invoke Windows executables. Chimera's command catalog therefore treats Windows and Linux command execution as interoperable provider capabilities.

## PowerToys and Terminal

PowerToys is represented as optional Windows desktop utilities. Windows Terminal/ConPTY is represented as a terminal/console provider. Neither is required for the headless/native kernel.

## Licensing and provenance

Each external project remains under its own license. The Chimera repository contains interfaces, capability metadata and original integration code; it does not claim ownership of Microsoft's repositories or redistribute their source.
