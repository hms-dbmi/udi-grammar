import * as React from 'react';
import type { UDIGrammar } from '../GrammarTypes';
import type { DataSelections } from '../DataSourcesStore';

export interface UDIVisProps {
  spec: UDIGrammar;
  selections?: DataSelections;
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

export function UDIVis({ spec, selections, onSelectionChange, onDataReady, className, style }: UDIVisProps) {
  const elRef: React.RefObject<HTMLElement | null> = React.useRef<HTMLElement>(null);

  // Register the custom element on first render
  React.useEffect(() => {
    ensureCERegistered();
  }, []);

  // Set complex object props via JS properties (not HTML attributes)
  React.useEffect(() => {
    if (elRef.current) {
      (elRef.current as any).spec = spec;
    }
  }, [spec]);

  React.useEffect(() => {
    if (elRef.current) {
      (elRef.current as any).selections = selections;
    }
  }, [selections]);

  // Listen for selection-change custom event
  React.useEffect(() => {
    const el = elRef.current;
    if (!el || !onSelectionChange) return;
    const handler = (e: Event) => onSelectionChange((e as CustomEvent).detail);
    el.addEventListener('selection-change', handler);
    return () => el.removeEventListener('selection-change', handler);
  }, [onSelectionChange]);

  // Listen for data-ready custom event
  React.useEffect(() => {
    const el = elRef.current;
    if (!el || !onDataReady) return;
    const handler = (e: Event) => onDataReady((e as CustomEvent).detail);
    el.addEventListener('data-ready', handler);
    return () => el.removeEventListener('data-ready', handler);
  }, [onDataReady]);

  return React.createElement('udi-vis', { ref: elRef, class: className, style });
}
