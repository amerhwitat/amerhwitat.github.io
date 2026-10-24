# Unity WebGL Launcher

Public route: https://amerhwitat.github.io/apps/webgl-unity/

This launcher runs the user's Unity WebGL archive in the browser after the user selects `webgl.zip`. It parses ZIP central-directory records, rejects unsafe paths, encrypted entries, unsupported compression, duplicate paths, malformed entries, and CRC mismatches; then decompresses Unity's gzip assets and starts the Unity loader using browser Blob URLs.

## Why the archive is selected in the browser

The original `webgl.zip` is a binary attachment. This repository integration can commit source files but cannot transfer that binary attachment directly into the GitHub repository. Consequently, the static site does not claim that the Unity payload is already hosted. Choose the original archive on the launcher page; extraction and runtime loading occur locally in the browser, without uploading the archive.

## Runtime

- Unity product: `unity3d-blockchain-wallet`, version `1.0`, company metadata `polats`.
- Requires WebAssembly, WebGL, `DecompressionStream` support for `deflate-raw` and `gzip`.
- Archive size limit: 256 MiB; extracted individual entry limit: 512 MiB.
- The launcher checks archive structure and CRCs. It does not audit the Unity application or certify wallet/security behavior.
- Use a current browser. The supplied build's actual compatibility still needs a browser/device runtime test after deployment.

## Test

```sh
node --check apps/webgl-unity/launcher.js
python3 tests/webgl_launcher_smoke.py
```

These checks validate source and launcher contract only. A successful real-runtime test requires loading the supplied archive in a supported browser and observing the Unity scene start.
