# Microsoft Open-Source and Windows Compatibility Stack

The native Chimera II track integrates Microsoft open-source projects as **capability providers**, not as vendored operating-system binaries.

## Catalogued providers

- Windows Subsystem for Linux (WSL/WSL2)
- WSLg
- PowerShell
- OpenSSH for Windows
- Windows Terminal / console infrastructure
- ConPTY
- WinGet
- WinGet Community Repository metadata
- Microsoft PowerToys
- Windows-compatible uutils/coreutils

## Integration model

`Microsoft provider -> capability catalog -> Chimera compatibility ABI -> host adapter`

This allows Chimera to discover and invoke facilities when the host provides them while retaining Linux/Unix alternatives.

## WinGet

WinGet is represented as a package-manager capability. Its installer ecosystem includes EXE, ZIP, INNO, Nullsoft, MSI, WiX, APPX, MSIX, BURN, portable and font packages in current documentation. Chimera should consume package metadata through an adapter instead of embedding the client.

## WSL

WSL is a particularly important bridge: Windows can execute Linux commands and Linux environments can invoke Windows executables. Chimera's command catalog therefore treats Windows and Linux command execution as interoperable provider capabilities.

## PowerToys and Terminal

PowerToys is represented as optional Windows desktop utilities. Windows Terminal/ConPTY is represented as a terminal/console provider. Neither is required for the headless/native kernel.

## Licensing and provenance

Each external project remains under its own license. The Chimera repository contains interfaces, capability metadata and original integration code; it does not claim ownership of Microsoft's repositories or redistribute their source.
