import type { SourceSpec, LoadDataPackageOptions } from '../loadDataPackage';

/**
 * Thin wrapper that lazy-loads ce-entry (same chunk as UDIVis / queryData)
 * and delegates to the real loadDataPackage implementation. Keeps the
 * React wrapper's static bundle small until the host actually needs it.
 */
export async function loadDataPackage(
  sources: SourceSpec[],
  options?: LoadDataPackageOptions,
): Promise<void> {
  const { loadDataPackage: impl } = await import('../ce-entry');
  return impl(sources, options);
}
