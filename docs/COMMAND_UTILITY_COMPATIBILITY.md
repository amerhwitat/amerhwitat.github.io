# Command and Utility Compatibility

Chimera II provides a portable command capability layer spanning Linux, Unix, Windows, macOS and WSL. The catalog describes providers and interfaces; it does not vendor third-party binaries into the repository.

## Microsoft PowerShell 7+

Microsoft PowerShell is an open-source, MIT-licensed, cross-platform automation shell/framework for Windows, Linux and macOS. Chimera exposes it as the `pwsh` capability and treats it as an optional runtime rather than Windows PowerShell 5.1. The upstream project documents Linux, Windows and macOS builds and explicitly distinguishes PowerShell 7+ from the legacy Windows PowerShell codebase.

## Core command families

| Family | Providers / commands |
|---|---|
| Shells | Bash, Zsh, Fish, PowerShell, CMD boundary |
| File utilities | coreutils/uutils, findutils, util-linux |
| Text processing | grep, sed, awk, gawk, cut, tr, sort, uniq, join, comm |
| Process/system | procps, psmisc, ps, top, kill, free, uptime, lsof boundary |
| Network | iproute2, iputils, OpenSSH, curl, wget, rsync |
| Archives/compression | tar, cpio, gzip, bzip2, xz, zstd |
| Development | git, make, binutils, gcc, gdb, m4, autoconf, automake, libtool |
| Data/config | jq, yq, file, sqlite3 |
| Interactive | screen, nano, less, emacs |
| Runtimes | Python 3, Java/OpenJDK, .NET, Node.js, Rust, Perl, Ruby, PHP |
| Package management | apt/dnf/pacman/brew/winget provider boundary |

## uutils and Microsoft Coreutils for Windows

uutils/coreutils is catalogued as a major cross-platform provider because it targets GNU-compatible command behavior across Linux, macOS, BSD, Windows and WASI. Microsoft also maintains **Coreutils for Windows**, a preview native Windows package built from uutils/coreutils plus findutils and grep. Chimera can select the native Windows provider or the Linux/WSL provider according to host capabilities.

## Microsoft command interoperability

WinGet, PowerShell, Windows Terminal, OpenSSH and WSL are exposed as provider capabilities. Windows/Linux command interoperability follows explicit executable paths and argument arrays. The native runtime must not construct shell commands from untrusted input.

## Optional services

The service catalog covers optional, policy-controlled providers including `sshd`, Samba, NFS server, BIND/named, dnsmasq, Apache httpd, nginx, Caddy, Postfix, Dovecot, chrony, rsyslog, syslog-ng, cron, systemd, D-Bus, Avahi, CUPS, BlueZ, libvirt, Podman, Docker, containerd, k3s, PostgreSQL, MariaDB, Redis and Mosquitto.

These entries are **capabilities**, not automatic daemons. Installation, activation, ports, credentials and data directories remain host-policy decisions.

## Licensing and provenance

Chimera stores compatibility metadata and interfaces only. External projects retain their own licenses and trademarks. In particular, PowerShell is MIT-licensed, while GNU utilities and the other listed projects have their respective upstream licenses. No proprietary Microsoft source is copied from historical W2K-ASM material.

## Security

Network scanners and security utilities are capability metadata only. Chimera does not automatically launch intrusive scans. Execution requires an explicit authorized runtime policy.
