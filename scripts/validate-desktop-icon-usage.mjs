import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync("apps/chimera-ii-os/web/desktop_experiences.html", "utf8");
const js = fs.readFileSync("apps/chimera-ii-os/web/desktop_experiences.js", "utf8");
const manifest = JSON.parse(fs.readFileSync("assets/icons/chimera-octavian/manifest.json", "utf8"));
const sprite = fs.readFileSync("assets/icons/chimera-octavian/catalog.svg", "utf8");
const known = new Set(manifest.apps.map(app => app.id));
const symbols = new Set([...sprite.matchAll(/<symbol\s+id="app-([a-z0-9-]+)"/g)].map(m => m[1]));
const references = [...(html + "\n" + js).matchAll(/catalog\.svg#app-([a-z0-9-]+)/g)].map(m => m[1]);
assert.ok(references.length >= 12, `Expected semantic desktop icon references, found ${references.length}`);
for (const id of references) {
  assert.ok(known.has(id), `Icon ${id} is missing from the shared manifest`);
  assert.ok(symbols.has(id), `Icon ${id} is missing from the shared SVG sprite`);
}
assert.match(html, /class="desktop-app-icon"/, "Desktop launchers must render SVG app icons");
assert.match(html, /id="marineStart"/, "Marine taskbar must expose its Start launcher");
assert.match(html, /id="startMenu"/, "Marine Start menu must exist");
assert.match(js, /#app-archive-manager/, "Finder volumes must use the archive-manager icon");
assert.doesNotMatch(js, /[\u{1F300}-\u{1FAFF}]/u, "Desktop app iconography must use the shared SVG set, not emoji");
console.log(`Validated ${references.length} semantic icon references against ${known.size} manifest entries and ${symbols.size} sprite symbols.`);
