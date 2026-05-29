import type {
  QueryDataSpec,
  QueryDataResult,
  QueryDataOptions,
} from '../ce-entry';
import type { DataSelections } from '../DataSourcesStore';

/**
 * Thin wrapper that lazy-loads ce-entry (same chunk as UDIVis) and
 * delegates to the real queryData implementation. This keeps the
 * React wrapper's static bundle small.
 */
export async function queryData(
  spec: QueryDataSpec,
  selections?: DataSelections,
  options?: QueryDataOptions,
): Promise<QueryDataResult | null> {
  const { queryData: impl } = await import('../ce-entry');
  return impl(spec, selections, options);
}
