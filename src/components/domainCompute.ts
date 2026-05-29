/**
 * Pure domain-computation logic. Shared between the Web Worker (which
 * runs it off the main thread) and the main-thread fallback path. No
 * top-level side effects so it's safe to import from either context.
 */

import type { DataFieldDomain, EntityComputeInput } from './domainTypes';

export function computeEntityDomains(
  resource: EntityComputeInput,
): DataFieldDomain[] {
  const domains: DataFieldDomain[] = [];

  for (const { name, values } of resource.columns) {
    const isNumeric = values.every(
      (v) => v == null || !isNaN(+(v as number)),
    );

    if (isNumeric) {
      let min = Infinity;
      let max = -Infinity;
      for (const v of values) {
        if (v == null) continue;
        const n = +(v as number);
        if (n < min) min = n;
        if (n > max) max = n;
      }
      domains.push({
        entity: resource.entityName,
        field: name,
        type: 'interval',
        fieldDescription: resource.fieldDescriptions[name] ?? '',
        domain: { min, max },
      });
    } else {
      domains.push({
        entity: resource.entityName,
        field: name,
        type: 'point',
        fieldDescription: resource.fieldDescriptions[name] ?? '',
        domain: { values: Array.from(new Set(values)) as string[] },
      });
    }
  }

  return domains;
}
