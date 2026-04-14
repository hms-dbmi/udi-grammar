import * as React from 'react';
import type { UDIGrammar } from '../GrammarTypes';
import type { DataSelections } from '../DataSourcesStore';

export interface UDIVisProps {
  spec: UDIGrammar;
  selections?: DataSelections;
  /** Map entity names to canonical data URLs, overriding whatever the spec contains. */
  sourceResolver?: Record<string, string>;
  onSelectionChange?: (selections: DataSelections) => void;
  onDataReady?: (payload: { data: object[] | null; allData: object[] | null; isSubset: boolean }) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Track whether the custom element has been registered
let ceRegistered = false;

async function ensureCERegistered() {
  if (ceRegistered || customElements.get('udi-vis')) {
    ceRegistered = true;
    return;
  }
  await import('../ce-entry');
  ceRegistered = true;
}

export function UDIVis({ spec, selections, sourceResolver, onSelectionChange, onDataReady, className, style }: UDIVisProps) {
  const elRef: React.RefObject<HTMLElement | null> = React.useRef<HTMLElement>(null);

  // Register the custom element on first render
  React.useEffect(() => {
    ensureCERegistered();
  }, []);

  // Set complex object props via JS properties (not HTML attributes).
  // useLayoutEffect ensures the property is set synchronously after the DOM
  // update, before the browser paints — this avoids a race where the Vue CE
  // processes connectedCallback before the prop is available.
  React.useLayoutEffect(() => {
    if (elRef.current) {
      (elRef.current as any).spec = spec;
    }
  }, [spec]);

  React.useLayoutEffect(() => {
    if (elRef.current) {
      (elRef.current as any).selections = selections;
    }
  }, [selections]);

  React.useLayoutEffect(() => {
    if (elRef.current) {
      (elRef.current as any).sourceResolver = sourceResolver;
    }
  }, [sourceResolver]);

  // Listen for selection-change custom event.
  // Vue CE wraps emit args in an array: detail = [arg0, arg1, ...].
  React.useEffect(() => {
    const el = elRef.current;
    if (!el || !onSelectionChange) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const payload = Array.isArray(detail) ? detail[0] : detail;
      onSelectionChange(payload);
    };
    el.addEventListener('selection-change', handler);
    return () => el.removeEventListener('selection-change', handler);
  }, [onSelectionChange]);

  // Listen for data-ready custom event.
  React.useEffect(() => {
    const el = elRef.current;
    if (!el || !onDataReady) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const payload = Array.isArray(detail) ? detail[0] : detail;
      onDataReady(payload);
    };
    el.addEventListener('data-ready', handler);
    return () => el.removeEventListener('data-ready', handler);
  }, [onDataReady]);

  return React.createElement('udi-vis', { ref: elRef, class: className, style });
}
