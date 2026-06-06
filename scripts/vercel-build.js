/**
 * Copies site files into public/ so Vercel serves them at / automatically.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'public');

const requiredDirs = ['assets', 'admin'];
for (const dir of requiredDirs) {
  const src = path.join(root, dir);
  if (!fs.existsSync(src)) {
    console.error(`\n❌ Build failed: missing "${dir}/" folder.`);
    console.error('   Upload api/, server/, assets/, admin/, scripts/ to GitHub (not only .html files).\n');
    process.exit(1);
  }
}

function copyRecursive(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

if (fs.existsSync(out)) {
  fs.rmSync(out, { recursive: true, force: true });
}
fs.mkdirSync(out, { recursive: true });

for (const name of fs.readdirSync(root)) {
  if (name.endsWith('.html')) {
    fs.copyFileSync(path.join(root, name), path.join(out, name));
  }
}

copyRecursive(path.join(root, 'assets'), path.join(out, 'assets'));
copyRecursive(path.join(root, 'admin'), path.join(out, 'admin'));

if (!fs.existsSync(path.join(out, 'index.html'))) {
  console.error('Build failed: public/index.html missing');
  process.exit(1);
}

const count = fs.readdirSync(out).length;
console.log(`Vercel build OK — public/ has ${count} top-level entries (Node ${process.version})`);
