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
  $("hash").onclick = async () => {
    const image=$("imagePath").value.trim(), expected=$("sha256").value.trim();
    if (!image) { log("Provide an image path first."); return; }
    const result=await call("/flash/verify-image", {image,sha256:expected});
    if (result && result.sha256) {
      $("sha256").value=result.sha256;
      log({...result, hint:result.matches ? "SHA-256 matches the expected digest." : "Computed digest filled in. Review it, then press Calculate / Verify again to confirm a match before flashing."});
    }
  };
  $("flash").onclick = async () => {
    const image=$("imagePath").value.trim(), device=$("devicePath").value.trim(), expected=$("sha256").value.trim().toLowerCase();
    if (!image || !device || !device.startsWith("/dev/")) { log("Refusing flash: provide an image and an explicit /dev/... target."); return; }
    if (!/^[0-9a-f]{64}$/.test(expected)) { log("Refusing flash: calculate and confirm a valid 64-character SHA-256 first."); return; }
    const verification=await call("/flash/verify-image", {image,sha256:expected});
    if (!verification || verification.status!=="match" || verification.matches!==true) {
      log("Refusing flash: image SHA-256 did not match. No write was attempted.");
      return;
    }
    if (!confirm("FLASH WARNING\n\nThis can permanently erase the selected device. Verify it is the intended removable device.\n\nImage: "+image+"\nSHA-256: "+expected+"\nTarget: "+device+"\n\nContinue to the native safety gate?")) return;
    const typed=prompt("Final safety check: type ERASE to authorize the native flash request. No write occurs if this is cancelled or mismatched.");
    if (typed !== "ERASE") { log("Flash cancelled: typed confirmation was not exactly ERASE. No write request was sent."); return; }
    await call("/flash/execute", {image,device,sha256:expected,confirmation:"ERASE"});
  };
  health();
})();