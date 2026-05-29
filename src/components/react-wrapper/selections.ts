/**
 * Thin wrappers that lazy-load ce-entry (same chunk as UDIVis / queryData
 * / loadDataPackage) and delegate to the shared Pinia DataSourcesStore.
 */

let cachedImpl: typeof import('../ce-entry') | null = null;

async function getImpl(): Promise<typeof import('../ce-entry')> {
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
