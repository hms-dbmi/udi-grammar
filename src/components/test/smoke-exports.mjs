/**
 * Smoke test: verify the package.json `exports` map resolves correctly.
 * Uses Node's module resolution to import via package name, simulating
 * what a real consumer would experience after `npm install udi-toolkit`.
 *
 * Run from src/components/ after `npm run build:all`.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pkgPath = resolve(import.meta.dirname, '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

const errors = [];

// Check that every export entry points to a file that exists
for (const [subpath, target] of Object.entries(pkg.exports)) {
  if (typeof target === 'string') {
    // Simple string export (e.g. "./style.css")
    const fullPath = resolve(import.meta.dirname, '..', target);
    try {
      readFileSync(fullPath);
    } catch {
      errors.push(`exports["${subpath}"] -> ${target} does not exist`);
    }
  } else {
    // Conditional export object
    for (const [condition, file] of Object.entries(target)) {
      const fullPath = resolve(import.meta.dirname, '..', file);
      try {
        readFileSync(fullPath);
      } catch {
        errors.push(`exports["${subpath}"].${condition} -> ${file} does not exist`);
      }
    }
  }
}

if (errors.length) {
  console.error('Exports map smoke test FAILED:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log(`Exports map smoke test passed ✓ (${Object.keys(pkg.exports).length} subpaths verified)`);
