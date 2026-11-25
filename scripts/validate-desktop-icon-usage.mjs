import fs from "node:fs";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

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

const read = path => fs.readFileSync(path, "utf8");
const local = asset => asset.replace(/^\//, "");
const sha256 = path => createHash("sha256").update(fs.readFileSync(path)).digest("hex");
const pngSize = path => {
  const bytes = fs.readFileSync(path);
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${path} is not a PNG`);
  assert.equal(bytes.toString("ascii", 12, 16), "IHDR", `${path} has no PNG IHDR`);
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
};
const pngs = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = `${dir}/${entry.name}`;
  if (entry.isDirectory()) return pngs(full);
  return entry.name.endsWith(".png") ? [full] : [];
});

const beveled = JSON.parse(read("assets/desktop-icons/beveled/BEVELED_MANIFEST.json"));
assert.equal(beveled.schema, "chimera-octavian-beveled-icon-set/v1");
assert.equal(beveled.concept_only, true, "Beveled icons must remain concept-only");
assert.equal(beveled.asset_count, 100);
assert.equal(beveled.records.length, 100);
assert.equal(beveled.source_set, "/assets/desktop-icons/slices/");
assert.equal(beveled.derived_set, "/assets/desktop-icons/beveled/");
assert.equal(beveled.geometry.size, "96x96");
assert.equal(beveled.geometry.corner_radius_px, 20);
assert.match(beveled.geometry.bevel, /dark outer ring/);
assert.match(beveled.geometry.bevel, /light inner ring/);
assert.match(beveled.generation.method, /deterministic ImageMagick/);
assert.match(beveled.generation.command, /roundrectangle 0,0 95,95 20,20/);
assert.match(beveled.generation.method, /no AI or random input/, "Generation must explicitly exclude AI and random input");

const byDerived = new Map();
const sourceSet = new Set();
const derivedSet = new Set();
for (const record of beveled.records) {
  for (const key of ["id", "source_asset", "derived_asset", "source_sha256", "derived_sha256"]) {
    assert.ok(record[key], `Beveled record is missing ${key}`);
  }
  assert.match(record.source_sha256, /^[0-9a-f]{64}$/);
  assert.match(record.derived_sha256, /^[0-9a-f]{64}$/);
  assert.ok(record.source_asset.startsWith("/assets/desktop-icons/slices/sheet-"), `Unexpected source ${record.source_asset}`);
  assert.ok(record.derived_asset.startsWith("/assets/desktop-icons/beveled/sheet-"), `Unexpected derivative ${record.derived_asset}`);
  assert.equal(
    record.derived_asset,
    "/assets/desktop-icons/beveled/" + record.source_asset.slice("/assets/desktop-icons/slices/".length),
    `Derived path does not mirror source for ${record.id}`,
  );
  assert.equal(local(record.source_asset).split("/").pop(), local(record.derived_asset).split("/").pop());
  const source = local(record.source_asset);
  const derived = local(record.derived_asset);
  assert.ok(fs.existsSync(source), `Source slice is missing: ${record.source_asset}`);
  assert.ok(fs.existsSync(derived), `Derived icon is missing: ${record.derived_asset}`);
  assert.equal(sha256(source), record.source_sha256, `Source SHA-256 changed: ${record.id}`);
  assert.equal(sha256(derived), record.derived_sha256, `Derived SHA-256 changed: ${record.id}`);
  assert.deepEqual(pngSize(source), [96, 96], `Source slice is not 96x96: ${record.id}`);
  assert.deepEqual(pngSize(derived), [96, 96], `Derived icon is not 96x96: ${record.id}`);
  sourceSet.add(record.source_asset);
  derivedSet.add(record.derived_asset);
  byDerived.set(record.derived_asset, record);
}
assert.equal(new Set(beveled.records.map(record => record.id)).size, 100, "Beveled record IDs must be unique");
assert.equal(sourceSet.size, 100, "Beveled manifest must cover 100 unique source slices");
assert.equal(derivedSet.size, 100, "Beveled manifest must cover 100 unique derived assets");
assert.deepEqual(
  [...sourceSet].sort(),
  pngs("assets/desktop-icons/slices").map(path => "/" + path.replace(/\\/g, "/")).sort(),
  "Beveled manifest must account for every published source slice",
);
assert.deepEqual(
  [...derivedSet].sort(),
  pngs("assets/desktop-icons/beveled").map(path => "/" + path.replace(/\\/g, "/")).sort(),
  "Beveled manifest must account for every published derivative",
);
console.log(`Validated ${beveled.records.length} beveled icons, SHA-256 digests and 96x96 geometry.`);

const iconMap = JSON.parse(read("assets/desktop-icons/ICON_MAP.json"));
assert.equal(iconMap.concept_only, true);
assert.equal(iconMap.source_slice_set, "/assets/desktop-icons/slices/");
assert.equal(iconMap.derived_set, "/assets/desktop-icons/beveled/");
assert.equal(iconMap.mapped_icon_count, manifest.apps.length);
assert.equal(Object.keys(iconMap.icons).length, manifest.apps.length);
assert.equal(manifest.source_slice_set, "/assets/desktop-icons/slices/");
assert.equal(manifest.derived_set, "/assets/desktop-icons/beveled/");
for (const [id, record] of Object.entries(iconMap.icons)) {
  assert.ok(record.asset.startsWith("/assets/desktop-icons/beveled/"), `ICON_MAP ${id} must use a beveled asset`);
  assert.ok(record.source_asset.startsWith("/assets/desktop-icons/slices/"), `ICON_MAP ${id} must retain source provenance`);
  assert.ok(fs.existsSync(local(record.asset)), `ICON_MAP asset is missing: ${id}`);
  const derivedRecord = byDerived.get(record.asset);
  assert.ok(derivedRecord, `ICON_MAP ${id} is not in BEVELED_MANIFEST.json`);
  assert.equal(derivedRecord.source_asset, record.source_asset, `ICON_MAP ${id} provenance mismatch`);
}
for (const app of manifest.apps) {
  assert.ok(app.image_source.startsWith("/assets/desktop-icons/beveled/"), `Manifest ${app.id} must use a beveled image`);
  assert.ok(app.source_slice.startsWith("/assets/desktop-icons/slices/"), `Manifest ${app.id} must retain a source slice`);
  const mapped = iconMap.icons[app.id];
  assert.ok(mapped, `Manifest ${app.id} is missing from ICON_MAP.json`);
  assert.equal(mapped.asset, app.image_source, `Manifest ${app.id} image_source mismatch`);
  assert.equal(mapped.source_asset, app.source_slice, `Manifest ${app.id} source_slice mismatch`);
}
const beveledRefs = [...sprite.matchAll(/<image href="\/assets\/desktop-icons\/beveled\//g)].length;
assert.ok(beveledRefs >= manifest.apps.length, `Expected ${manifest.apps.length} beveled sprite references, found ${beveledRefs}`);
assert.ok(!sprite.includes('<image href="/assets/desktop-icons/slices/'), "Sprite must render beveled icons, not source slices");
assert.ok(sprite.includes("/assets/desktop-icons/beveled/BEVELED_MANIFEST.json"), "Sprite must retain beveled provenance");

const usagePages = [
  "desktops/gallery.js",
  "desktops/index.html",
  "desktops/freewin11.html",
  "desktops/freexp.html",
  "apps/chimera-ii-os/web/desktop_experiences.html",
  "apps/chimera-ii-os/web/desktop_experiences.css",
  "apps/chimera-ii-os/web/release-closure-dashboard.html",
  "apps/chimera-ii-os/web/final-release-disposition.html",
];
const renderedSourcePattern = /(?:src|href)\s*=\s*["']\/assets\/desktop-icons\/slices\//;
const cssSourcePattern = /url\(\s*["']?\/assets\/desktop-icons\/slices\//;
for (const rel of usagePages) {
  const text = read(rel);
  assert.ok(text.includes("/assets/desktop-icons/beveled/"), `${rel} must use beveled icons`);
  assert.ok(!renderedSourcePattern.test(text), `${rel} still renders source slices`);
  assert.ok(!cssSourcePattern.test(text), `${rel} still loads source slices from CSS`);
}
assert.ok(fs.existsSync("scripts/build_beveled_desktop_icons.sh"), "Deterministic beveled icon build script is missing");
console.log(`Validated ${manifest.apps.length} mapped catalogue icons and ${usagePages.length} beveled-icon usage surfaces.`);
