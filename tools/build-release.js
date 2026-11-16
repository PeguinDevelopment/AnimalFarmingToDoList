// Baut ein eigenständiges Paket einer Edition (eigene index.html im Wurzelordner, eigener Service Worker).
// Aufruf: node tools/build-release.js <tiere|feen> <Zielordner>
// Wird von .github/workflows/release.yml benutzt, funktioniert aber auch lokal.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const [edition, out] = process.argv.slice(2);
const NAMES = { tiere: 'AnimalFarmingToDoList', feen: 'FeenwaldToDoList' };
if (!NAMES[edition] || !out) { console.error('Aufruf: node tools/build-release.js <tiere|feen> <Zielordner>'); process.exit(1); }

const name = NAMES[edition];
const dir = path.join(out, name);
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(path.join(dir, 'icons'), { recursive: true });
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const copy = (from, to = from) => fs.copyFileSync(path.join(root, from), path.join(dir, to));

const shared = ['app.js', 'animals.js', 'world.js', 'styles.css', 'README.md', 'DEPLOY.md'];
shared.forEach(f => copy(f));
let files;
if (edition === 'tiere') {
  copy('index.html'); copy('manifest.webmanifest');
  for (const n of [180, 192, 512]) copy(`icons/icon-${n}.png`);
  files = ['styles.css', 'app.js', 'animals.js', 'world.js'];
} else {
  fs.writeFileSync(path.join(dir, 'index.html'), read('feen/index.html').replace(/\.\.\//g, ''));
  copy('feen/manifest.webmanifest', 'manifest.webmanifest');
  fs.writeFileSync(path.join(dir, 'edition-feen.js'), read('edition-feen.js').replace("swPath: '../sw.js'", "swPath: 'sw.js'"));
  copy('feen.css');
  for (const n of [180, 192, 512]) copy(`feen/icons/icon-${n}.png`, `icons/icon-${n}.png`);
  files = ['styles.css', 'feen.css', 'app.js', 'animals.js', 'world.js', 'edition-feen.js'];
}

// Service Worker nur mit den Dateien dieser Edition
const list = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', ...files].map(f => `'${f}'`).join(', ');
const sw = read('sw.js')
  .replace(/const FILES = \[[\s\S]*?\];/, `const FILES = [${list}];`)
  .split("caches.match(new URL(e.request.url).pathname.includes('/feen/') ? 'feen/index.html' : 'index.html')").join("caches.match('index.html')");
fs.writeFileSync(path.join(dir, 'sw.js'), sw);
console.log(`${name} gebaut in ${dir}`);
