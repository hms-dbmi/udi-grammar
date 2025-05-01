import type { RowMapping } from './GrammarTypes';
import { interpolateYlOrRd, schemeSet3 } from 'd3-scale-chromatic';

export function getDomainLookupKey(mapping: RowMapping): string {
  const { field, type } = mapping;
  return `${field}¶${type}`;
}

export interface RowMappingWithDomain extends RowMapping {
  domain: Domain;
}

export interface NumberDomain {
  min: number;
  max: number;
}
export interface StringDomain {
  values: string[];
}
export type Domain = NumberDomain | StringDomain;

export const defaultRange = {
  quantitative: [0, 1],
  unknownQuantitative: -10,
  quantitativeColor: (t: number) => interpolateYlOrRd((t + 0.15) / 1.15),
  unknownColor: '#EB10E0',
  nominalColor: schemeSet3,
};
