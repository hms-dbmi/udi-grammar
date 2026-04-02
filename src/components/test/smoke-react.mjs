/**
 * Smoke test: verify the React wrapper build exports the expected symbols.
 * Run from src/components/ after `npm run build:all`.
 *
 * Loads a DOM shim because the React wrapper dynamically imports the CE
 * entry (which calls customElements.define).
 */
import './dom-shim.mjs';
import { UDIVis } from '../dist/react.js';
import { check } from './check.mjs';

const errors = [];


check('UDIVis', UDIVis);

if (typeof UDIVis !== 'function') {
  errors.push(`UDIVis should be a function, got ${typeof UDIVis}`);
}

if (errors.length) {
  console.error('React build smoke test FAILED:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log('React build smoke test passed ✓');
