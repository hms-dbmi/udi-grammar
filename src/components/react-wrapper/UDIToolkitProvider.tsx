import * as React from 'react';
import type { UDIPalette } from '../Palette';
import { loadDataPackage } from './loadDataPackage';
import type { SourceSpec, LoadDataPackageOptions } from '../loadDataPackage';

export type DataPackageLoadPhase = 'idle' | 'loading' | 'ready' | 'error';

export interface DataPackageStatus {
  phase: DataPackageLoadPhase;
  /** Most recent error from any source's load. Cleared on a fresh attempt. */
  error: string | null;
}

export interface DataPackageConfig extends LoadDataPackageOptions {
  /** Sources to fetch + cache. */
  sources: SourceSpec[];
}

export interface UDIToolkitContextValue {
  palette: UDIPalette | undefined;
  status: DataPackageStatus;
}

/**
 * Internal context shared by `UDIToolkitProvider` and the hook surface. The
 * default is the no-provider state — calls to `usePalette` outside a provider
 * read `undefined` (descendants then fall back to `DEFAULT_PALETTE` via the
 * usual per-channel resolution in VegaLite.vue / table cell renderers).
 */
export const UDIToolkitContext = React.createContext<UDIToolkitContextValue>({
  palette: undefined,
  status: { phase: 'idle', error: null },
});

export interface UDIToolkitProviderProps {
  /**
   * Default palette inherited by every nested `<UDIVis>`. A per-instance
   * `palette` prop on the chart still wins — the context is a *fallback*,
   * not an override.
   */
  palette?: UDIPalette;
  /**
   * Optional data-package descriptor. When supplied, the provider calls
   * `loadDataPackage(sources, options)` on mount (and again any time the
   * `sources` array's URL list changes), seeds the shared DataSourcesStore,
   * and tracks load progress in `useDataPackageStatus()`. Consumers driving
   * the load themselves can omit this and the provider stays palette-only.
   */
  dataPackage?: DataPackageConfig;
  children?: React.ReactNode;
}

/** Identity-stable join of source URLs — drives the load-effect's deps. */
function sourceFingerprint(sources: SourceSpec[] | undefined): string {
  if (!sources || sources.length === 0) return '';
  return sources.map((s) => `${s.name}|${s.url}`).join('\n');
}

/**
 * Root-level Provider for the udi-toolkit. Holds the consumer palette and,
 * if `dataPackage` is supplied, auto-loads it via the shared Pinia
 * DataSourcesStore. Place once at the root of your app; nested `<UDIVis>`
 * instances inherit the palette without per-instance threading and
 * descendant hooks (`useSelections`, `useQueryData`, `useDataPackageStatus`,
 * `useClearAllSelections`) can subscribe to the data layer without each
 * consumer rebuilding the same subscribe/pump scaffold.
 */
export function UDIToolkitProvider({
  palette,
  dataPackage,
  children,
}: UDIToolkitProviderProps): React.ReactElement {
  const [status, setStatus] = React.useState<DataPackageStatus>({
    phase: 'idle',
    error: null,
  });

  // Use a fingerprint to depend on the sources' contents rather than their
  // array identity — common for inline object-literal props.
  const fingerprint = sourceFingerprint(dataPackage?.sources);

  // Stash the latest callbacks in a ref so a callback prop swap doesn't
  // re-trigger the load effect (only sources should).
  const cfgRef = React.useRef<DataPackageConfig | undefined>(dataPackage);
  cfgRef.current = dataPackage;

  React.useEffect(() => {
    const cfg = cfgRef.current;
    if (!cfg || cfg.sources.length === 0) return;
    let cancelled = false;
    setStatus({ phase: 'loading', error: null });
    let observedError: string | null = null;
    void loadDataPackage(cfg.sources, {
      fetchOptions: cfg.fetchOptions,
      onEntityDomains: (entity, domains) => {
        if (cancelled) return;
        cfgRef.current?.onEntityDomains?.(entity, domains);
      },
      onError: (entity, message) => {
        if (cancelled) return;
        observedError = message;
        cfgRef.current?.onError?.(entity, message);
      },
    })
      .then(() => {
        if (cancelled) return;
        setStatus(
          observedError === null
            ? { phase: 'ready', error: null }
            : { phase: 'error', error: observedError },
        );
      })
      .catch((e) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setStatus({ phase: 'error', error: msg });
      });
    return () => {
      cancelled = true;
    };
  }, [fingerprint]);

  const value = React.useMemo<UDIToolkitContextValue>(
    () => ({ palette, status }),
    [palette, status],
  );

  return <UDIToolkitContext.Provider value={value}>{children}</UDIToolkitContext.Provider>;
}
