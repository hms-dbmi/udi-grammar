/**
 * Smoke test: verify the CE build exports the expected symbols and
 * that Vue's defineCustomElement produced a valid constructor.
 *
 * Loads a minimal DOM shim so the module can evaluate in Node.js.
 * Browser-level testing should use Playwright.
 */
import './dom-shim.mjs';
import { UDIVisElement } from '../dist/ce.js';

const errors = [];

function check(name, value) {
  if (value == null) {
    errors.push(`${name} is ${value}`);
  }
}

check('UDIVisElement', UDIVisElement);

if (typeof UDIVisElement !== 'function') {
  errors.push(`UDIVisElement should be a function/class, got ${typeof UDIVisElement}`);
}

if (errors.length) {
  console.error('CE build smoke test FAILED:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log('CE build smoke test passed ✓');
