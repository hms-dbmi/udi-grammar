import * as React from 'react';
import {
  UDIToolkitContext,
  type DataPackageStatus,
} from './UDIToolkitProvider';
import type { UDIPalette } from '../Palette';
import type { DataSelections } from '../DataSourcesStore';
import type { QueryDataSpec, QueryDataResult, QueryDataOptions } from '../ce-entry';
import { queryData } from './queryData';
import {
  subscribeToSelections,
  clearAllSelections,
  getDataSelections,
} from './selections';

/**
 * Default palette inherited from the nearest `UDIToolkitProvider` ancestor,
 * or `undefined` if no provider is in the tree (the existing per-channel
 * `DEFAULT_PALETTE` fallback inside `<UDIVis>` then applies).
 */
export function usePalette(): UDIPalette | undefined {
  return React.useContext(UDIToolkitContext).palette;
}

/**
 * Snapshot of the data-package load lifecycle managed by the provider.
 * Returns `{ phase: 'idle', error: null }` when no provider is mounted (or
 * the provider didn't receive a `dataPackage` prop).
 */
export function useDataPackageStatus(): DataPackageStatus {
  return React.useContext(UDIToolkitContext).status;
}

/**
 * Stable callback that wraps `clearAllSelections`. Resolved promise so
 * callers can `await` it in reset handlers. Identity-stable across renders
 * — safe to depend on in effects.
 */
export function useClearAllSelections(): () => Promise<void> {
  return React.useCallback(() => clearAllSelections(), []);
}

/**
 * Subscribe to the shared selection state. Returns the current `DataSelections`
 * snapshot, re-rendering only when the selection hash flips (not on every
 * 60 Hz brush tick during a drag — the underlying store coalesces). Starts
 * out empty during the initial async load of ce-entry, then fills in.
 */
export function useSelections(): DataSelections {
  const [snapshot, setSnapshot] = React.useState<DataSelections>({});

  React.useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | null = null;

    const refresh = async () => {
      const next = await getDataSelections();
      if (cancelled) return;
      // getDataSelections returns a reference-stable snapshot per
      // selectionHash, so React's bail-out on equal state works — this
      // setState is a no-op when selections haven't actually changed.
      setSnapshot(next);
    };

    void (async () => {
      await refresh();
      if (cancelled) return;
      const u = await subscribeToSelections(() => {
        if (!cancelled) void refresh();
      });
      if (cancelled) {
        u();
        return;
      }
      unsub = u;
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  return snapshot;
}

export interface UseQueryDataResult {
  displayData: object[] | null;
  allData: object[] | null;
  isSubset: boolean;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_LOADING_RESULT: UseQueryDataResult = Object.freeze({
  displayData: null,
  allData: null,
  isSubset: false,
  isLoading: true,
  error: null,
});

export interface UseQueryDataBaseOptions extends QueryDataOptions {
  /**
   * Pause the pump. When false the hook holds its last committed result(s),
   * skips queryData calls, and unsubscribes from selection changes. Default
   * true. Useful for gating on a "data ready" flag from the host.
   */
  enabled?: boolean;
  /**
   * Explicit selections forwarded into `queryData`. Brush state lives in the
   * shared store and is read directly by queryData; this argument is for
   * LLM / programmatic filters layered on top.
   */
  selections?: DataSelections;
}

export interface UseQueryDataSingleOptions extends UseQueryDataBaseOptions {
  /**
   * Fires whenever the query resolves. When provided, the hook routes
   * results to the callback instead of storing them in React state — the
   * host doesn't re-render on every settle. `isLoading` / `error` on the
   * returned object are still tracked so callers can render a spinner.
   */
  onResult?: (result: QueryDataResult | null) => void;
}

export interface UseQueryDataMapOptions<K extends string = string>
  extends UseQueryDataBaseOptions {
  /**
   * Per-key callback. Fires once per spec entry per pump cycle. Same trade-
   * off as the single-spec form — supplying it skips the per-entity React
   * state update so the host stays still while results flow into a host-
   * managed store.
   */
  onResult?: (key: K, result: QueryDataResult | null) => void;
}

/**
 * Reactive wrapper around `queryData`. Two forms:
 *
 * - **Single spec** — pass a `QueryDataSpec`, get back a `UseQueryDataResult`.
 * - **Map of specs** — pass `{ [key]: QueryDataSpec }`, get back a matching
 *   map of results. All entries share one pump and run sequentially within
 *   each cycle so they observe a consistent snapshot of the shared store;
 *   brush ticks landing mid-cycle are coalesced into one follow-up run.
 *
 * Either form may pass `onResult` to opt out of internal React state — the
 * hook then routes results to the callback (typically a Zustand / Pinia
 * setter) and the host doesn't re-render on every settle.
 *
 * Re-runs when: the spec content changes, `enabled` flips on, or any brush /
 * external selection update fires through `subscribeToSelections`. Spec deps
 * are content-fingerprinted (`JSON.stringify`) so inline object literals
 * don't tear on every render.
 *
 * Subsumes the old `useEntityQueryPump` pattern that consumers (DataCounts
 * in udi-chat-react) used to roll by hand — that file can now delegate to
 * this hook in multi-spec callback mode.
 */
export function useQueryData(
  spec: QueryDataSpec,
  options?: UseQueryDataSingleOptions,
): UseQueryDataResult;
export function useQueryData<K extends string>(
  specs: Record<K, QueryDataSpec>,
  options?: UseQueryDataMapOptions<K>,
): Record<K, UseQueryDataResult>;
export function useQueryData(
  input: QueryDataSpec | Record<string, QueryDataSpec>,
  options?: UseQueryDataSingleOptions | UseQueryDataMapOptions,
): UseQueryDataResult | Record<string, UseQueryDataResult> {
  // Discriminate by shape. A single QueryDataSpec carries `source` at its
  // top level; a map of specs doesn't (the `source` lives one level down).
  const isSingle =
    input != null && typeof input === 'object' && 'source' in input;
  // Lock the input shape to the first-render decision via ref so a runtime
  // shape swap doesn't tear React's hooks order or the returned type. (A
  // consumer that needs to switch shapes should remount the hook.)
  const isSingleRef = React.useRef(isSingle);
  const inputShapeIsSingle = isSingleRef.current;

  // Refs for hot state the pump reads each cycle — keeps the effect's
  // identity stable as props change.
  const inputRef = React.useRef(input);
  inputRef.current = input;
  const optionsRef = React.useRef(options);
  optionsRef.current = options;

  // Aggregate state keyed by spec entry. For the single-spec form, the
  // internal key is the empty string; the public return value unwraps it.
  const [results, setResults] = React.useState<Record<string, UseQueryDataResult>>(
    () =>
      inputShapeIsSingle
        ? { '': INITIAL_LOADING_RESULT }
        : Object.fromEntries(
            Object.keys(input as Record<string, QueryDataSpec>).map((k) => [
              k,
              INITIAL_LOADING_RESULT,
            ]),
          ),
  );

  // Content fingerprint of the spec(s) so changes trigger a re-run without
  // tearing on object-identity churn from inline literals.
  const fingerprint = React.useMemo(() => JSON.stringify(input), [input]);
  const enabled = options?.enabled ?? true;

  React.useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let running = false;
    let requested = false;
    let unsub: (() => void) | null = null;

    const runCycle = async () => {
      requested = true;
      if (running) return;
      running = true;
      while (requested && !cancelled) {
        requested = false;
        const curInput = inputRef.current;
        const curOptions = optionsRef.current;
        const curSelections = curOptions?.selections;
        const onResult = curOptions?.onResult as
          | ((keyOrResult: string | QueryDataResult | null, result?: QueryDataResult | null) => void)
          | undefined;

        const entries: Array<[string, QueryDataSpec]> = inputShapeIsSingle
          ? [['', curInput as QueryDataSpec]]
          : Object.entries(curInput as Record<string, QueryDataSpec>);

        for (const [key, spec] of entries) {
          if (cancelled) break;
          let out: QueryDataResult | null = null;
          let errMessage: string | null = null;
          try {
            out = await queryData(spec, curSelections, curOptions);
          } catch (e) {
            errMessage = e instanceof Error ? e.message : String(e);
          }
          if (cancelled) break;

          if (onResult) {
            // Callback mode: route the result outward and skip the host
            // re-render. The single-spec overload sees `(result)`; the
            // map overload sees `(key, result)`.
            if (inputShapeIsSingle) {
              (onResult as (result: QueryDataResult | null) => void)(out);
            } else {
              (onResult as (k: string, result: QueryDataResult | null) => void)(key, out);
            }
          } else {
            // Stateful mode: commit each entry's result into the aggregate
            // state. Multiple settles within the same microtask are still
            // separate setStates — acceptable for the "render the data
            // myself" case where the host wants to react to results.
            setResults((prev) => ({
              ...prev,
              [key]: {
                displayData: out?.displayData ?? null,
                allData: out?.allData ?? null,
                isSubset: out?.isSubset ?? false,
                isLoading: false,
                error: errMessage,
              },
            }));
          }
        }
      }
      running = false;
    };

    // Reset loading status on fresh enable / spec change. Iterating with
    // `Object.entries` (instead of `Object.keys`) lets the local `entry`
    // be narrowed once — under `noUncheckedIndexedAccess` a `prev[k]`
    // read would otherwise widen back to `UseQueryDataResult | undefined`
    // on each access.
    setResults((prev) => {
      const next: Record<string, UseQueryDataResult> = {};
      for (const [k, entry] of Object.entries(prev)) {
        next[k] = entry.isLoading ? entry : { ...entry, isLoading: true };
      }
      return next;
    });

    void runCycle();
    void subscribeToSelections(() => {
      if (!cancelled) void runCycle();
    }).then((u) => {
      if (cancelled) u();
      else unsub = u;
    });

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [fingerprint, enabled, inputShapeIsSingle]);

  if (inputShapeIsSingle) {
    return results[''] ?? INITIAL_LOADING_RESULT;
  }
  return results;
}
