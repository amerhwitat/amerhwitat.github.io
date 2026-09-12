# Amer Hwitat — Public Research Web

This repository hosts the public web surface for Amer Hwitat's open research projects, including the Chimera II OS ecosystem.

## Build and run

For static content, preview with a local HTTP server from the repository root. If a Node.js application directory exists, run its declared package-manager scripts after `npm ci`/the lockfile-equivalent install.

Repository-wide orchestration:

```bat
build-tools\build.bat --only node
```

or:

```powershell
.\build-tools\build.ps1 -Only node
```

CI uses GitHub Actions to build and publish the web surface. Generated bundles remain CI/deployment artifacts rather than source files.

## Chimera II OS public research index

- **Public index:** `chimera/index.html`
- **Complete portfolio summary:** `https://github.com/amerhwitat/ChimeraIIOS/blob/main/docs/CHIMERA_ECOSYSTEM_PORTFOLIO.md`
- **Canonical OS source:** https://github.com/amerhwitat/ChimeraIIOS
- **Mobile/embedded integration:** https://github.com/amerhwitat/general
- **CPU research:** https://github.com/amerhwitat/CPU4096
- **CPU simulator:** https://github.com/amerhwitat/CPU4096Simulator
- **Python integration:** https://github.com/amerhwitat/test
- **Java track:** https://github.com/amerhwitat/keygen
- **NLP:** https://github.com/amerhwitat/nlp
- **PDF research:** https://github.com/amerhwitat/PDFreaderPY
- **Crypto research:** https://github.com/amerhwitat/eth-key-check and https://github.com/amerhwitat/bruteforce
- **Graphics experiments:** https://github.com/amerhwitat/BizX and https://github.com/amerhwitat/BizXtreme

## Native ASM/C/C++ track

The native integration work includes an 8192-bit register model, canonical instruction representation, Koronos/128D research primitives, Spit Fire boot coordination, runtime/filesystem/network catalogs and cross-platform command compatibility.

## Source-of-truth rule

The canonical Chimera II OS implementation is maintained in `amerhwitat/ChimeraIIOS`. This website repository provides discovery and documentation surfaces rather than replacing the canonical source tree.
