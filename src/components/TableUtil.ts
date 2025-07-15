import type { Domain, RowMapping } from './GrammarTypes';
import { interpolateYlOrRd, schemeSet3 } from 'd3-scale-chromatic';

export function getDomainLookupKey(mapping: RowMapping): string {
  const { column, field, type } = mapping;
  return `${column}¶${field}¶${type}`;
}

export interface ExtendedRowMapping extends RowMapping {
  domain: Domain;
  layer: string;
}

export const defaultRange = {
  quantitative: [0, 1],
  unknownQuantitative: 0,
  quantitativeColor: (t: number) => interpolateYlOrRd((t + 0.15) / 1.15),
  unknownColor: '#EB10E0',
  nominalColor: schemeSet3,
};
