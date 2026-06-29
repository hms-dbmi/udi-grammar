/**
 * Thin wrappers that lazy-load ce-entry (same chunk as UDIVis / queryData
 * / loadDataPackage) and delegate to the shared Pinia DataSourcesStore.
 */

import type * as CEEntry from '../ce-entry';
import type { DataSelections } from '../DataSourcesStore';

let cachedImpl: typeof CEEntry | null = null;

async function getImpl(): Promise<typeof CEEntry> {
  if (!cachedImpl) {
    cachedImpl = await import('../ce-entry');
  }
  return cachedImpl;
}

/**
 * Fire `callback` whenever any selection in the shared DataSourcesStore
 * changes. Returns a promise of the unsubscribe function — the underlying
 * Pinia store loads lazily, so subscription can't be synchronous.
 *
 * The single-arg `() => void` convention matches Vue's `watch` stop fn
 * and Pinia's `$subscribe` so consumers can treat it like any other
 * store subscription.
 */
export async function subscribeToSelections(
  callback: () => void,
): Promise<() => void> {
  const impl = await getImpl();
  return impl.subscribeToSelections(callback);
}

/** Clear every active selection in the shared DataSourcesStore. */
export async function clearAllSelections(): Promise<void> {
  const impl = await getImpl();
  impl.clearAllSelections();
}

/**
 * Snapshot of the current selection state. Resolves to a reference-stable
 * object that only changes when `selectionHash` flips — safe to use as the
 * `getSnapshot` half of a `useSyncExternalStore` pair.
 *
 * Lazy because the Pinia store loads on first call; once initialized, the
 * underlying read is synchronous. Subsequent calls still return promises
 * (the API surface stays uniform) and remain effectively instant.
 */
export async function getDataSelections(): Promise<DataSelections> {
  const impl = await getImpl();
  return impl.getDataSelections();
}
