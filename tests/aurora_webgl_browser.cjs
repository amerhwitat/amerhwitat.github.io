const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { setTimeout: delay } = require('node:timers/promises');
const { chromium } = require('playwright');
(async () => {
  const server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], {stdio:'ignore'});
  let browser;
  try {
    let ready = false;
    for (let i=0; i<40; i++) {
      try { const response = await fetch('http://127.0.0.1:8765/apps/chimera-ii-os/web/aurora_webgl_desktops.html'); if (response.ok) { ready=true; break; } } catch {}
      await delay(250);
    }
    assert.ok(ready, 'local Pages preview server did not start');
    browser = await chromium.launch({headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    const page = await browser.newPage({viewport:{width:1440,height:900}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:8765/apps/chimera-ii-os/web/aurora_webgl_desktops.html');
    await page.waitForFunction(() => {
      const value = document.querySelector('#renderer')?.textContent || '';
      return value.includes('active') || value === 'Unavailable' || value === 'Shader error';
    }, null, {timeout:15000});
    const renderer = await page.locator('#renderer').innerText();
    assert.match(renderer, /WebGL 2|WebGL 1 fallback/, 'headless browser should expose a WebGL context');
    await page.waitForFunction(() => Number(document.querySelector('#fps')?.textContent || 0) > 0, null, {timeout:10000});
    await page.locator('#settings').click();
    assert.equal(await page.locator('#settingsDialog').evaluate(el => el.open), true);
    await page.locator('#renderScale').evaluate(el => {el.value='120';el.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.locator('#scaleValue').innerText(), '120%');
    await page.locator('#motionToggle').uncheck();
    await page.locator('#settingsDialog button[value=close]').click();
    await page.locator('#runtime').click();
    const runtime = await page.locator('#runtimeContent').innerText();
    assert.match(runtime, /Native OpenGL \/ EGL/);
    assert.match(runtime, /No live kernel bridge/);
    assert.doesNotMatch(runtime, /Koronos graphics service\s+ready/i);
    await page.locator('#runtimeDialog button[value=close]').click();
    await page.locator('#launcher').click();
    await page.locator('#profiles button').first().click();
    assert.ok((await page.locator('#desktopTitle').innerText()).length > 0);
    assert.deepEqual(errors, [], 'WebGL gallery should not emit uncaught JavaScript errors');

    // Exercise the existing full Aurora desktop as well: it must use the local
    // shader renderer rather than silently depending on a remote Three.js CDN.
    await page.goto('http://127.0.0.1:8765/apps/chimera-ii-os/web/aurora_3d_desktop.html');
    await page.waitForFunction(() => window.AuroraWebGLActive === true && document.querySelector('#gpuState')?.textContent === 'WEBGL', null, {timeout:15000});
    const desktopRenderer = await page.locator('#gpuState').innerText();
    assert.equal(desktopRenderer, 'WEBGL', 'Aurora 3D desktop should initialize WebGL in the headless test');
    await page.locator('#soundToggle').click();
    assert.equal(await page.locator('#soundToggle').getAttribute('aria-pressed'), 'false');
    await page.locator('#soundToggle').click();
    assert.equal(await page.locator('#soundToggle').getAttribute('aria-pressed'), 'true');
    await page.keyboard.press('Control+Shift+A');
    assert.equal(await page.locator('#auroraControlPanel').evaluate(el => !el.classList.contains('hidden')), true);
    await page.locator('#toggle3D').click();
    assert.equal(await page.locator('#renderState').innerText(), '2D');
    await page.locator('#toggle3D').click();
    assert.equal(await page.locator('#renderState').innerText(), '3D');
    assert.deepEqual(errors, [], 'Aurora desktop should not emit uncaught JavaScript errors');

    await page.goto('http://127.0.0.1:8765/apps/chimera-test-suite/aurora_3d_desktop.html');
    await page.waitForFunction(() => window.AuroraWebGLActive === true, null, {timeout:15000});
    await page.locator('#openTerminal').click();
    assert.equal(await page.locator('#terminalWindow').evaluate(el => !el.classList.contains('hidden')), true);
    assert.deepEqual(errors, [], 'Aurora test desktop should not emit uncaught JavaScript errors');
    console.log('Aurora WebGL browser smoke: PASS (' + renderer + '); existing desktop: ' + desktopRenderer + '; test desktop: WebGL');
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
})().catch(error => { console.error(error); process.exit(1); });
