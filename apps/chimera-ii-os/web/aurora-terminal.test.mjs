import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
const root='apps/chimera-ii-os/web/';
const html=fs.readFileSync(root+'aurora-terminal-shell.html','utf8');
const js=fs.readFileSync(root+'aurora_terminal.js','utf8');
test('published shell lab has all shell profiles',()=>{for(const name of ['bash','zsh','fish','cmd','powershell','chimera'])assert.ok(html.includes('value="'+name+'"'));});
test('published shell is a safe in-memory browser terminal',()=>{assert.match(js,/textContent/);assert.doesNotMatch(js,/innerHTML|eval\s*\(/);assert.match(js,/browser virtual filesystem/);assert.match(js,/Run on host/);});
