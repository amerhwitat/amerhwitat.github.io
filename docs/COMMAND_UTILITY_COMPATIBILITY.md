# Command and Utility Compatibility

Chimera II provides a portable command capability layer spanning Linux, Unix, Windows and WSL.

## Core command families

| Family | Providers |
|---|---|
| Shells | Bash, Zsh, Fish, PowerShell, CMD boundary |
| File utilities | coreutils/uutils, findutils, util-linux |
| Text | grep, sed, awk |
| Process | procps, ps, top-compatible providers |
| Network | iproute2, iputils, OpenSSH, curl, wget |
| Archives | tar and compression utilities |
| Development | git, compiler/toolchain adapters |
| Synchronization | rsync |
| Package management | apt/dnf/pacman/brew/winget provider boundary |

## uutils

uutils/coreutils is catalogued as a major cross-platform provider because it targets GNU-compatible command behavior across Linux, macOS, BSD, Windows and WASI. Chimera should prefer it on hosts where a native Windows/portable coreutils implementation is desirable.

## Microsoft command interoperability

WinGet, PowerShell, Windows Terminal and WSL are exposed as provider capabilities. Command execution must use argument arrays and explicit executable paths; the native runtime must not construct shell commands from untrusted input.

## Security

Network scanners and security utilities are capability metadata only. Chimera does not automatically launch intrusive scans. Execution requires an explicit authorized runtime policy.
