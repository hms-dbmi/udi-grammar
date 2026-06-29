import * as React from 'react';
import type { UDIGrammar } from '../GrammarTypes';
import type { UDIPalette } from '../Palette';
import type { DataSelections } from '../DataSourcesStore';
import { UDIToolkitContext } from './UDIToolkitProvider';

export interface UDIVisProps {
  spec: UDIGrammar;
  selections?: DataSelections;
  /** Map entity names to canonical data URLs, overriding whatever the spec contains. */
  sourceResolver?: Record<string, string>;
  /**
   * Make the chart fill its parent (both width and height) and respond to
   * container resizes. Requires the parent to have a definite height.
   */
  fillContainer?: boolean;
  /**
   * Consumer-supplied default color palette for charts and tables. May include
   * a continuous color function for numeric scales — set as a JS property on
   * the custom element, so functions pass through intact.
   */
  palette?: UDIPalette;
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

export function UDIVis({ spec, selections, sourceResolver, fillContainer, palette, onSelectionChange, onDataReady, className, style }: UDIVisProps) {
  const elRef: React.RefObject<HTMLElement | null> = React.useRef<HTMLElement>(null);

  // Palette fallback chain: own prop → UDIToolkitProvider's context palette →
  // undefined (the custom element then falls back to DEFAULT_PALETTE per
  // channel in VegaLite.vue / table cell renderers). Default context value
  // is `{ palette: undefined }` so this is a no-op when no provider exists.
  const contextPalette = React.useContext(UDIToolkitContext).palette;
  const effectivePalette = palette ?? contextPalette;

  // Register the custom element on first render
  React.useEffect(() => {
    ensureCERegistered();
  }, []);

  // Set fillContainer BEFORE spec so the Vue component's first render()
  // already has the prop available.
  React.useLayoutEffect(() => {
    if (elRef.current) {
      (elRef.current as any).fillContainer = fillContainer;
    }
  }, [fillContainer]);

  // Set complex object props via JS properties (not HTML attributes).
  // useLayoutEffect ensures the property is set synchronously after the DOM
  // update, before the browser paints — this avoids a race where the Vue CE
  // processes connectedCallback before the prop is available.
  //
  // Order matters: sourceResolver must be set BEFORE spec. UDIVis.vue
  // reacts to spec changes by running render() → initDataSources, which
  // reads props.sourceResolver. If spec arrives first, the initial fetch
  // goes out against whatever URL the spec itself contains (e.g. a fallback URL, 
  // or a URL from the default spec) before the host-provided resolver has a
  // chance to override it.
  React.useLayoutEffect(() => {
    if (elRef.current) {
      (elRef.current as any).sourceResolver = sourceResolver;
    }
  }, [sourceResolver]);

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

  // Palette can carry a function (continuous color), so it must be set as a JS
  // property — HTML attributes only carry strings. `effectivePalette` resolves
  // own-prop → context-provider → undefined; downstream channel-level fallback
  // to DEFAULT_PALETTE happens inside VegaLite.vue.
  React.useLayoutEffect(() => {
    if (elRef.current) {
      (elRef.current as any).palette = effectivePalette;
    }
  }, [effectivePalette]);

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
