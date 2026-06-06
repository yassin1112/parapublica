/**
 * Run before pushing to GitHub / Vercel.
 * npm run check:deploy
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

const requiredDirs = ['api', 'server', 'assets', 'admin', 'scripts'];
const requiredFiles = [
  'api/index.js',
  'api/[...path].js',
  'server/app.js',
  'server/index.js',
  'scripts/vercel-build.js',
  'index.html',
  'package.json',
  'package-lock.json',
  'vercel.json',
  '.node-version',
  'assets/css/style.css',
  'assets/js/main.js',
];

let ok = true;

for (const dir of requiredDirs) {
  const p = path.join(root, dir);
  if (!fs.existsSync(p)) {
    console.error(`❌ Missing folder: ${dir}/`);
    ok = false;
  }
}

for (const file of requiredFiles) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) {
    console.error(`❌ Missing file: ${file}`);
    ok = false;
  }
}

if (fs.existsSync(path.join(root, '.env'))) {
  console.warn('⚠️  .env exists — do NOT upload it to GitHub (secrets). Use Vercel Environment Variables.');
}

if (fs.existsSync(path.join(root, 'yassin basa.rar'))) {
  console.warn('⚠️  Delete yassin basa.rar from GitHub — upload folders directly, not RAR.');
}

if (ok) {
  console.log('✅ Project ready for GitHub + Vercel deploy.');
  process.exit(0);
}

console.error('\nFix missing files, then push ALL folders to github.com/yassin1112/bad-bad-boy');
process.exit(1);
