(() => {
  const bridge = "http://127.0.0.1:8765";
  const $ = (id) => document.getElementById(id);
  function log(value) {
    $("log").textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  }
  async function call(path, payload) {
    try {
      const r = await fetch(bridge + path, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload || {}) });
      const data = await r.json();
      log(data);
      return data;
    } catch (e) {
      log("Local Chimera bridge unavailable. Start tools/runtime/chimera-local-bridge.py, then retry.\n\n" + e.message);
      return null;
    }
  }
  async function health() {
    try {
      const r = await fetch(bridge + "/health", {cache:"no-store"});
      const d = await r.json();
      $("bridgeState").textContent = "Bridge: online";
      return d;
    } catch (_) {
      $("bridgeState").textContent = "Bridge: offline";
      return null;
    }
  }
  $("isoInfo").onclick = () => call("/iso/info", {iso:$("isoPath").value.trim()});
  $("isoVerify").onclick = () => call("/iso/verify", {iso:$("isoPath").value.trim()});
  $("detect").onclick = () => call("/flash/detect", {});
  $("hash").onclick = () => call("/flash/verify-image", {image:$("imagePath").value.trim(),sha256:$("sha256").value.trim()});
  $("flash").onclick = async () => {
    const image=$("imagePath").value.trim(), device=$("devicePath").value.trim(), expected=$("sha256").value.trim();
    if (!image || !device || !device.startsWith("/dev/")) { log("Refusing flash: provide an image and a /dev/... removable target."); return; }
    if (!confirm("FLASH WARNING\n\nThis can permanently erase the selected device.\n\nImage: "+image+"\nTarget: "+device+"\n\nContinue to the native safety gate?")) return;
    await call("/flash/execute", {image,device,sha256:expected});
  };
  health();
})();