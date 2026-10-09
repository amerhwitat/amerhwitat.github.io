const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

async function get(url) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

async function refresh() {
  try {
    const [cpu, isa, rt] = await Promise.all([get('/api/cpu/state'), get('/api/isa'), get('/api/runtime/catalog')]);
    $('#cpu').textContent = JSON.stringify(cpu, null, 2);
    $('#isa').innerHTML = isa.instructions.map(x => `<span class="${x.defined ? 'defined' : ''}">${x.hex} ${x.name}</span>`).join('');
    $('#runtime').innerHTML = `<h3>Commands</h3><p>${rt.commands.join(' · ')}</p><h3>Optional services</h3><p>${rt.services.join(' · ')}</p><h3>Filesystems</h3><p>${rt.filesystems.join(' · ')}</p><h3>Networks</h3><p>${rt.network.join(' · ')}</p>`;
    return true;
  } catch (error) {
    $('#commandOutput').textContent = `Refresh failed: ${error.message}`;
    return false;
  }
}

function runDemo() {
  $('#cpu').textContent = `Demo instruction: ADD R1,R2 → R0\nR1=10\nR2=32\nR0=42\nWidth=${$('#width').value} bits`;
  $('#commandOutput').textContent = 'demo: executed ADD R1,R2 → R0';
}

async function generateKeys() {
  $('#keys').textContent = JSON.stringify(await get('/api/keygen'), null, 2);
  $('#commandOutput').textContent = 'keygen: generated Ed25519 key pair';
}

async function generateRandom() {
  $('#rand').textContent = (await get('/api/random')).bytes;
  $('#commandOutput').textContent = 'random: generated 256-bit value';
}

async function executeCommand(raw) {
  const command = String(raw || '').trim().toLowerCase();
  if (!command) return;
  if (command === 'demo' || command === 'add') return runDemo();
  if (command === 'refresh' || command === 'reload') return refresh();
  if (command === 'keygen' || command === 'keys') return generateKeys();
  if (command === 'random' || command === 'rand') return generateRandom();
  if (command === 'cpu') { document.querySelector('#cpu')?.scrollIntoView({ behavior: 'smooth' }); $('#commandOutput').textContent = 'cpu: focused CPU state'; return; }
  if (command === 'isa') { document.querySelector('#isa')?.scrollIntoView({ behavior: 'smooth' }); $('#commandOutput').textContent = 'isa: focused instruction matrix'; return; }
  if (command === 'runtime' || command === 'services') { document.querySelector('#runtime')?.scrollIntoView({ behavior: 'smooth' }); $('#commandOutput').textContent = 'runtime: focused services'; return; }
  if (command === 'help' || command === '?') { $('#commandOutput').textContent = 'Commands: demo | refresh | keygen | random | cpu | isa | runtime | help'; return; }
  $('#commandOutput').textContent = `Unknown command: ${command}. Type help and press Enter.`;
}

$('#refresh')?.addEventListener('click', refresh);
$('#demo')?.addEventListener('click', runDemo);
$('#keygen')?.addEventListener('click', () => generateKeys().catch(e => { $('#commandOutput').textContent = `keygen failed: ${e.message}`; }));
$('#random')?.addEventListener('click', () => generateRandom().catch(e => { $('#commandOutput').textContent = `random failed: ${e.message}`; }));
$('#commandForm')?.addEventListener('submit', event => {
  event.preventDefault();
  executeCommand($('#command')?.value).catch(e => { $('#commandOutput').textContent = `Command failed: ${e.message}`; });
});
$('#command')?.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    $('#commandForm')?.requestSubmit();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') $('#command')?.blur();
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    $('#command')?.focus();
  }
});

document.addEventListener('click', event => {
  const button = event.target instanceof Element ? event.target.closest('button') : null;
  if (!button) return;
  button.classList.add('pressed');
  setTimeout(() => button.classList.remove('pressed'), 120);
});

refresh();
