(function () {
  "use strict";
  const REQUIRED = [
    "webgl/webgl/Build/webgl.loader.js",
    "webgl/webgl/Build/webgl.data.gz",
    "webgl/webgl/Build/webgl.framework.js.gz",
    "webgl/webgl/Build/webgl.wasm.gz"
  ];
  const MAX_ARCHIVE = 256 * 1024 * 1024;
  const MAX_FILE = 512 * 1024 * 1024;
  const $ = (id) => document.getElementById(id);
  const input = $("archive-input"), drop = $("drop-zone"), status = $("status");
  const panel = $("loader-panel"), player = $("player-panel"), progressWrap = $("progress-wrap");
  const progress = $("progress"), runtimeError = $("runtime-error"), unityProgress = $("unity-progress");
  let objectUrls = [], unityInstance = null, busy = false;

  function setStatus(message, kind) {
    status.textContent = message;
    status.dataset.kind = kind || "info";
  }
  function setProgress(value) {
    progressWrap.hidden = false;
    progress.style.width = Math.max(0, Math.min(100, value)) + "%";
  }
  function concatBytes(chunks, total) {
    const out = new Uint8Array(total); let offset = 0;
    for (const chunk of chunks) { out.set(chunk, offset); offset += chunk.length; }
    return out;
  }
  function crc32(bytes) {
    let crc = -1;
    for (let i = 0; i < bytes.length; i++) {
      crc ^= bytes[i];
      for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ -1) >>> 0;
  }
  async function inflateRaw(bytes) {
    if (typeof DecompressionStream !== "function") throw new Error("This browser lacks the Compression Streams API. Please use a current Chromium, Firefox, or Safari release.");
    let stream;
    try { stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw")); }
    catch (e) { throw new Error("This browser does not support ZIP DEFLATE extraction (deflate-raw). Update the browser and try again."); }
    const out = new Uint8Array(await new Response(stream).arrayBuffer());
    if (out.byteLength > MAX_FILE) throw new Error("An extracted archive entry exceeds the 512 MB safety limit.");
    return out;
  }
  async function gunzip(bytes, label) {
    let stream;
    try { stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")); }
    catch (e) { throw new Error(label + " is not a valid gzip stream or this browser cannot decompress it."); }
    const out = new Uint8Array(await new Response(stream).arrayBuffer());
    if (out.byteLength > MAX_FILE) throw new Error(label + " expands beyond the 512 MB safety limit.");
    return out;
  }
  async function parseZip(buffer) {
    const bytes = new Uint8Array(buffer), view = new DataView(buffer);
    if (bytes.length > MAX_ARCHIVE) throw new Error("Archive exceeds the 256 MB safety limit.");
    let eocd = -1, lower = Math.max(0, bytes.length - 65557);
    for (let i = bytes.length - 22; i >= lower; i--) {
      if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error("Not a valid ZIP archive (end-of-central-directory record missing).");
    if (view.getUint16(eocd + 4, true) !== 0 || view.getUint16(eocd + 6, true) !== 0)
      throw new Error("Multi-disk ZIP archives are not supported.");
    const count = view.getUint16(eocd + 10, true), centralSize = view.getUint32(eocd + 12, true);
    let cursor = view.getUint32(eocd + 16, true);
    if (count === 0xffff || centralSize === 0xffffffff || cursor === 0xffffffff)
      throw new Error("ZIP64 archives are not supported by this launcher.");
    if (count > 10000 || cursor + centralSize > bytes.length) throw new Error("ZIP directory is malformed or exceeds entry limits.");
    const entries = new Map();
    for (let i = 0; i < count; i++) {
      if (cursor + 46 > bytes.length || view.getUint32(cursor, true) !== 0x02014b50)
        throw new Error("Malformed ZIP central directory.");
      const flags = view.getUint16(cursor + 8, true), method = view.getUint16(cursor + 10, true);
      const crc = view.getUint32(cursor + 16, true), compressedSize = view.getUint32(cursor + 20, true);
      const size = view.getUint32(cursor + 24, true), nameLen = view.getUint16(cursor + 28, true);
      const extraLen = view.getUint16(cursor + 30, true), commentLen = view.getUint16(cursor + 32, true);
      const localOffset = view.getUint32(cursor + 42, true);
      if (flags & 1) throw new Error("Encrypted ZIP entries are not supported.");
      if (size > MAX_FILE || compressedSize > MAX_ARCHIVE) throw new Error("ZIP entry exceeds safety limits.");
      const nameBytes = bytes.slice(cursor + 46, cursor + 46 + nameLen);
      const name = new TextDecoder((flags & 0x800) ? "utf-8" : "utf-8", {fatal:true}).decode(nameBytes).replace(/\\/g, "/");
      if (name.startsWith("/") || name.split("/").includes("..")) throw new Error("Unsafe archive path rejected.");
      if (!name.endsWith("/")) {
        if (entries.has(name)) throw new Error("Duplicate ZIP path rejected: " + name);
        if (localOffset + 30 > bytes.length || view.getUint32(localOffset, true) !== 0x04034b50)
          throw new Error("Malformed local ZIP header for " + name);
        const localNameLen = view.getUint16(localOffset + 26, true), localExtraLen = view.getUint16(localOffset + 28, true);
        const start = localOffset + 30 + localNameLen + localExtraLen, end = start + compressedSize;
        if (end > bytes.length) throw new Error("Truncated ZIP entry: " + name);
        const packed = bytes.slice(start, end);
        let raw;
        if (method === 0) raw = packed;
        else if (method === 8) raw = await inflateRaw(packed);
        else throw new Error("Unsupported ZIP compression method " + method + " for " + name);
        if (raw.length !== size || crc32(raw) !== crc) throw new Error("ZIP integrity check failed for " + name);
        entries.set(name, raw);
      }
      cursor += 46 + nameLen + extraLen + commentLen;
    }
    for (const name of REQUIRED) if (!entries.has(name)) throw new Error("Required Unity build file is missing: " + name + ". Select the original webgl.zip archive.");
    return entries;
  }
  function makeUrl(bytes, type) {
    const url = URL.createObjectURL(new Blob([bytes], {type}));
    objectUrls.push(url); return url;
  }
  function cleanup() {
    if (unityInstance && unityInstance.Quit) {
      try { unityInstance.Quit(); } catch (_) {}
    }
    unityInstance = null;
    for (const url of objectUrls) URL.revokeObjectURL(url);
    objectUrls = [];
  }
  function showError(error) {
    const message = error && error.message ? error.message : String(error);
    setStatus(message, "error");
    runtimeError.textContent = message;
    runtimeError.hidden = false;
    $("player-state").textContent = "Failed";
    $("unity-loading").hidden = true;
  }
  async function startArchive(file) {
    if (busy) return;
    if (!file || !/\.zip$/i.test(file.name)) { setStatus("Please choose a .zip archive.", "error"); return; }
    if (file.size > MAX_ARCHIVE) { setStatus("Archive exceeds the 256 MB safety limit.", "error"); return; }
    busy = true; input.disabled = true; drop.setAttribute("aria-busy", "true");
    setStatus("Reading archive…"); setProgress(5);
    try {
      cleanup();
      const buffer = await file.arrayBuffer();
      setStatus("Validating ZIP entries and checksums…"); setProgress(18);
      const entries = await parseZip(buffer);
      setStatus("Decompressing Unity WebAssembly and data…"); setProgress(35);
      const loaderBytes = entries.get(REQUIRED[0]);
      const data = await gunzip(entries.get(REQUIRED[1]), "webgl.data.gz"); setProgress(53);
      const framework = await gunzip(entries.get(REQUIRED[2]), "webgl.framework.js.gz"); setProgress(70);
      const wasm = await gunzip(entries.get(REQUIRED[3]), "webgl.wasm.gz"); setProgress(83);
      const loaderText = new TextDecoder("utf-8", {fatal:true}).decode(loaderBytes);
      if (!loaderText.includes("createUnityInstance")) throw new Error("Unity loader did not contain createUnityInstance.");
      if (wasm.length < 8 || wasm[0] !== 0 || wasm[1] !== 97 || wasm[2] !== 115 || wasm[3] !== 109)
        throw new Error("The extracted payload is not a valid WebAssembly module.");
      const loaderUrl = makeUrl(loaderBytes, "text/javascript");
      const dataUrl = makeUrl(data, "application/octet-stream");
      const frameworkUrl = makeUrl(framework, "text/javascript");
      const codeUrl = makeUrl(wasm, "application/wasm");
      panel.hidden = true; player.hidden = false; runtimeError.hidden = true;
      $("unity-loading").hidden = false; $("player-state").textContent = "Loading Unity engine…";
      setStatus("Launching Unity runtime…"); setProgress(90);
      const script = document.createElement("script");
      script.src = loaderUrl;
      script.onload = async function () {
        try {
          if (typeof createUnityInstance !== "function") throw new Error("Unity loader loaded but createUnityInstance is unavailable.");
          const canvas = $("unity-canvas");
          const config = {
            dataUrl, frameworkUrl, codeUrl, streamingAssetsUrl: "StreamingAssets",
            companyName: "polats", productName: "unity3d-blockchain-wallet", productVersion: "1.0",
            matchWebGLToCanvasSize: true, devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2)
          };
          unityInstance = await createUnityInstance(canvas, config, function (value) {
            const pct = Math.round(value * 100);
            unityProgress.style.width = pct + "%";
            $("unity-progress-label").textContent = pct + "%";
            $("player-state").textContent = "Initializing Unity… " + pct + "%";
          });
          $("unity-loading").hidden = true;
          $("player-state").textContent = "Running";
          $("fullscreen").disabled = false;
          $("fullscreen").onclick = () => { if (unityInstance) unityInstance.SetFullscreen(1); };
          setStatus("Unity runtime started. The app is running in this tab.");
          setProgress(100);
        } catch (e) { showError(e); }
      };
      script.onerror = () => showError(new Error("Unity loader script failed to execute."));
      document.body.appendChild(script);
    } catch (e) {
      showError(e);
      panel.hidden = false; player.hidden = true;
    } finally {
      busy = false; input.disabled = false; drop.removeAttribute("aria-busy");
    }
  }
  input.addEventListener("change", () => { if (input.files && input.files[0]) startArchive(input.files[0]); });
  drop.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input.click(); }
  });
  ["dragenter", "dragover"].forEach((name) => drop.addEventListener(name, (event) => {
    event.preventDefault(); drop.classList.add("dragging");
  }));
  ["dragleave", "drop"].forEach((name) => drop.addEventListener(name, (event) => {
    event.preventDefault(); drop.classList.remove("dragging");
  }));
  drop.addEventListener("drop", (event) => {
    const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) startArchive(file);
  });
  $("reset").addEventListener("click", () => {
    cleanup(); player.hidden = true; panel.hidden = false; input.value = "";
    runtimeError.hidden = true; setStatus("Waiting for archive."); setProgress(0);
    progressWrap.hidden = true; $("fullscreen").disabled = true; $("unity-loading").hidden = false;
  });
  // Export parser for isolated test harnesses; this does not imply successful Unity execution.
  window.WebGLZipLauncher = {parseZip, crc32, requiredFiles: REQUIRED.slice()};
})();
