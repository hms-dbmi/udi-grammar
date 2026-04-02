/**
 * Smoke test: verify the Vue library build exports the expected symbols.
 * Run from src/components/ after `npm run build`.
 */
import { UDIToolkit, UDIVis, TableComponent, VegaLite } from '../dist/index.js';

import { check } from './check.mjs';
const errors = [];

check('UDIToolkit', UDIToolkit);
check('UDIToolkit.install', UDIToolkit?.install);
check('UDIVis', UDIVis);
check('TableComponent', TableComponent);
check('VegaLite', VegaLite);

if (errors.length) {
  console.error('Vue build smoke test FAILED:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log('Vue build smoke test passed ✓');
