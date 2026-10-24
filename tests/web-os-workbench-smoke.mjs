import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = resolve(root, 'apps/chimera-ii-os/web/web-os-workbench.html');
const cssPath = resolve(root, 'apps/chimera-ii-os/web/web-os-workbench.css');
const jsPath = resolve(root, 'apps/chimera-ii-os/web/web-os-workbench.js');
const html = readFileSync(htmlPath, 'utf8');
const css = readFileSync(cssPath, 'utf8');
const js = readFileSync(jsPath, 'utf8');

assert.match(html, /<html lang="en">/i, 'document declares a language');
assert.match(html, /id="view-desktop"/, 'desktop view exists');
assert.match(html, /id="view-install"/, 'install/upgrade view exists');
assert.match(html, /id="view-assistant"/, 'chat view exists');
assert.match(html, /id="view-files"/, 'workspace view exists');
assert.match(html, /id="chatMessages"/, 'chat transcript surface exists');
assert.match(html, /id="exportHistory"/, 'history export control exists');
assert.match(html, /id="importHistory"/, 'history import control exists');
assert.match(html, /id="verifyIso"/, 'ISO verification control exists');
assert.match(html, /name="viewport"/, 'responsive viewport is configured');
assert.match(html, /browser-based companion/i, 'browser/native boundary is disclosed');
assert.ok(css.includes('@media(max-width:650px)'), 'mobile layout rules exist');

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'HTML IDs are unique');
for (const match of js.matchAll(/\$\('([^']+)'\)/g)) {
  assert.ok(ids.includes(match[1]), `JS DOM reference exists in HTML: ${match[1]}`);
}
for (const asset of ['web-os-workbench.css', 'web-os-workbench.js']) {
  assert.ok(existsSync(resolve(dirname(htmlPath), asset)), `local asset exists: ${asset}`);
}
assert.match(js, /dual-os-chat-history\.v1/, 'chat archive uses a versioned storage key');
assert.match(js, /schema:'dual-os-chat-history',version:1/, 'chat archive has a versioned JSON schema');
assert.match(js, /dual-os-chat-history\.json/, 'chat archive can be exported as JSON');
assert.match(js, /addEventListener\('change'/, 'controls have change handlers');
assert.match(js, /crypto\.subtle\.digest\('SHA-256'/, 'ISO bytes can be hashed with Web Crypto');
assert.match(js, /CreateMLCEngine/, 'WebLLM browser inference adapter exists');
assert.match(js, /mode==='endpoint'/, 'remote endpoint adapter exists');
assert.match(js, /offline helper/i, 'non-neural fallback is explicitly named');
assert.match(js, /RNN\/CNN inference requires compatible weights/, 'unavailable model weights are not misrepresented');
assert.doesNotMatch(js, /\beval\s*\(|new Function\s*\(/, 'no dynamic code evaluation');
assert.doesNotMatch(js, /navigator\.usb|navigator\.serial|\bformat\(/, 'no raw device/format operation is exposed');
const chimeraIndex = readFileSync(resolve(root, 'apps/chimera-ii-os/web/index.html'), 'utf8');
const octavianIndex = readFileSync(resolve(root, 'apps/octavianos/web/index.html'), 'utf8');
assert.match(chimeraIndex, /href="web-os-workbench\.html"/, 'Chimera landing page links the workbench');
assert.match(octavianIndex, /href="\.\.\/\.\.\/chimera-ii-os\/web\/web-os-workbench\.html"/, 'Octavian companion links the workbench');

console.log('Web OS Workbench smoke checks passed.');
