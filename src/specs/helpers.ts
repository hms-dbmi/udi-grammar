import type { RowMapping } from "src/components/GrammarTypes";

export function getColorCategoryMapping(field: string): RowMapping[] {
  return [
    {
      field,
      encoding: 'color',
      mark: 'rect',
      type: 'nominal',
    },
    {
      field,
      encoding: 'text',
      mark: 'text',
      type: 'quantitative',
    },
  ];
}

export function getColorBarMapping(field: string): RowMapping[] {
  return [
    {
      field,
      encoding: 'x',
      mark: 'bar',
      type: 'quantitative',
    },
    {
      field,
      encoding: 'text',
      mark: 'text',
      type: 'quantitative',
    },
    {
      field,
      encoding: 'color',
      mark: 'bar',
      type: 'quantitative',
    },
  ];
}
