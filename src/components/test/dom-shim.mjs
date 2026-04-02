/**
 * Minimal DOM shim so CE modules can load in Node.js.
 * Only stubs what's needed for module evaluation — does NOT
 * provide a real DOM. Browser-level testing should use Playwright.
 */
if (typeof globalThis.HTMLElement === 'undefined') {
  globalThis.HTMLElement = class HTMLElement {};
}

if (typeof globalThis.customElements === 'undefined') {
  const registry = new Map();
  globalThis.customElements = {
    define(name, ctor) {
      registry.set(name, ctor);
    },
    get(name) {
      return registry.get(name);
    },
  };
}

if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement() {
      return {};
    },
    createElementNS() {
      return {};
    },
    createTextNode() {
      return {};
    },
    createComment() {
      return {};
    },
  };
}

if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = { userAgent: 'node' };
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis;
}

if (typeof globalThis.SVGElement === 'undefined') {
  globalThis.SVGElement = class SVGElement {};
}

if (typeof globalThis.MutationObserver === 'undefined') {
  globalThis.MutationObserver = class MutationObserver {
    observe() {}
    disconnect() {}
  };
}
