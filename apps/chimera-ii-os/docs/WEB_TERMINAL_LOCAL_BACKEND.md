# Connect Aurora Terminal to a local shell

Aurora Terminal on GitHub Pages is a static web application. The browser-only shell remains
available without installation. To run commands on your own Chimera II OS or OctavianOS
machine, start the local bridge on that machine.

## Start the bridge

Chimera II OS:

    git clone https://github.com/amerhwitat/ChimeraIIOS.git
    cd ChimeraIIOS
    python3 tools/runtime/chimera-terminal-backend.py

OctavianOS:

    git clone https://github.com/amerhwitat/OctavianOS.git
    cd OctavianOS
    python3 vendor/chimera-ii-os/source/tools/runtime/chimera-terminal-backend.py

The server uses only Python's standard library and prints a one-time bearer token. In Aurora Terminal, enter
http://127.0.0.1:8767 and paste that token into the Local shell connection panel, then
select Connect Local Shell.

## Safe mode and full shell mode

Safe mode is the default. It provides navigation, workspace file operations, metadata
commands and a reviewed command set. It does not invoke a shell, run arbitrary commands,
or read/write outside the configured workspace.

To deliberately enable a real installed shell, start the bridge with --unsafe-shell.
This grants commands the same local-user privileges as the account running the bridge.
It is not a sandbox. Only enable it when you trust the page and the machine, and use a
disposable VM/container for untrusted programs.

## Security properties

- The server binds only to 127.0.0.1 by default; non-loopback bind addresses are rejected.
- Every command requires a bearer token printed at startup.
- Browser requests are restricted to the GitHub Pages origin and local development origins.
- Host headers, request size, command length and per-session rate are checked.
- Safe-mode file operations are confined to the configured workspace.
- The bridge does not run commands on GitHub Pages servers and does not download binaries.
- No Kickstart, Windows, macOS or other proprietary firmware is distributed by this feature.

The shell selector chooses the requested local shell profile when full-shell mode is enabled.
If a selected shell is not installed on the host, the bridge reports that instead of silently
substituting another shell.
