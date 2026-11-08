# Aurora Terminals & Shells — Chimera II OS and OctavianOS

## Integrated inventory

Aurora's terminal and shell registries are shared by the Chimera II OS and OctavianOS hosted Linux live-image builder.

**20 terminal emulators**

- Alacritty
- Black Box Terminal
- Contour
- Foot
- Ghostty
- GNOME Console
- GNOME Terminal
- Kitty
- Konsole
- LXTerminal
- MATE Terminal
- Ptyxis
- QTerminal
- Sakura
- Terminator
- Terminology
- Tilix
- WezTerm
- XFCE Terminal
- XTerm

**8 shells**

- GNU Bash
- Z Shell (zsh)
- fish
- Debian Almquist Shell (dash)
- MirBSD Korn Shell (mksh)
- Yet Another Shell (yash)
- Elvish
- Nushell

The registries are curated project inventories, not a claim that every open-source terminal or shell ever published is included.

## Build and verification pipeline

1. Prefer a package built by the target distribution for the target rootfs architecture.
2. For missing packages, invoke a source-build recipe only when one is implemented and its toolchain dependencies are available.
3. Record package/source status, upstream source revision, license, executable path and SHA-256 for source-built providers.
4. Validate ELF machine type against the target ABI, or validate a script's declared interpreter inside the target rootfs.
5. Run shell command smoke tests and terminal version/help probes.
6. Create an Aurora launcher only for a provider that exists and passes the relevant checks. Missing or failing providers remain visible in the report and do not receive launchers.
7. Do not generate placeholder binaries or treat an SS64 command reference as a binary source.

The shared build path uses:

- `tools/aurora/install-terminal-shell-suite.sh`
- `tools/aurora/build-terminal-shell-sources.sh`
- `live-image/verify-terminal-shell-suite.sh`
- `tools/aurora/verify-terminal-shell-providers.py`
- `aurora/terminals/install-desktop-entries.sh`
- `aurora/terminals/aurora-terminal-center.sh`
- `aurora/shells/aurora-shell-center.sh`

The final rootfs receives the terminal/shell registries, binary manifests, provider-status JSON, installed-provider records and verified launchers. The live-image CI checks the registered counts (20 terminals, 8 shells) and the actual provider inventory.

## Display server integration

Both hosted Linux desktop editions package the distribution's real X.Org X Server and Xwayland, plus `xinit`, `startx`, X11 utilities and input/video drivers.

- `chimera-xserver-session list` discovers installed XDG X11 sessions.
- `chimera-xserver-session status` checks the active X display.
- `chimera-xserver-session start SESSION_ID` launches the selected installed desktop through X.Org.
- The dispatcher refuses missing session binaries and does not fabricate desktop entries.
- Wayland desktops are launched by their own Wayland compositor; they are not run inside X.Org.

This X.Org integration belongs to the Debian/Linux-backed hosted images. It is **not** a native Koronos X server. Koronos still needs its own display/DRM/KMS/input stack or a real port of an existing server/compositor before native Aurora and other graphical desktops can run.

## Architecture and compatibility boundary

The hosted build pipeline supports eight Linux userspace ABI command build targets. A shell or terminal is accepted only if its actual executable is present and matches the target ABI. Cross-building Linux ELF binaries does not make them Koronos-native and does not prove that a Koronos kernel port exists.

Current native kernel status and remaining gaps are tracked in the [Koronos boot and desktop runtime dashboard](../web/koronos-boot-sequence.html).

## Upstream source references

The canonical repository URLs and license identifiers are stored in:

- `aurora/terminals/registry.json`
- `aurora/terminals/binary-manifest.json`
- `aurora/shells/registry.json`
- `aurora/shells/binary-manifest.json`

The source-build scripts record the exact upstream commit used for each source-built provider. A registry entry alone does not mean that a package is installed or that its runtime smoke test passed.
