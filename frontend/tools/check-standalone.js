#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function walk(dir, cb) {
  fs.readdirSync(dir).forEach((f) => {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, cb);
    else cb(full);
  });
}

const matches = [];
walk(path.join(__dirname, '..', 'src', 'app'), (file) => {
  if (!file.endsWith('.ts')) return;
  const txt = fs.readFileSync(file, 'utf8');
  if (/standalone\s*:\s*true/.test(txt)) matches.push(file);
});

if (matches.length === 0) {
  console.log('No standalone: true found in src/app — good.');
  process.exit(0);
}

console.log('Found standalone components:');
matches.forEach((m) => console.log(' -', path.relative(process.cwd(), m)));
process.exit(1);
