export interface UDIGrammar {
  dataSource: DataSource | DataSource[];
  dataTransformations?: DataTransformation[];
  dataRepresentation: GoGComponent | GoGComponent[] | CustomComponent;
}

export interface DataSource {
  key: string;
  source: string; // url of csv for now
}

export type DataTransformation = GroupBy | RollUp; // TODO: expand transformations

export interface GroupBy {
  groupby: string;
}

export interface RollUp {
  rollup: {
    [outputName: string]: AggregateFunction;
  };
}

export interface AggregateFunction {
  op: 'count' | 'mean' | 'min' | 'max' | 'median';
  field?: 'string';
}

export interface Component {
  type: string;
}

export interface GoGComponent extends Component {
  type: 'GoGComponent';
  mark: Mark;
  encoding: Encoding;
}

export type CustomComponent =
  | TableComponent
  | FilterPanelComponent
  | OrganMapComponent;

export interface TableComponent extends Component {
  type: 'TableComponent';
}

export interface FilterPanelComponent extends Component {
  type: 'FilterPanelComponent';
}

export interface OrganMapComponent extends Component {
  type: 'OrganMapComponent';
}

export interface Mark {
  // point, bar, text?. icon
}

export interface Encoding {
  // x,y,color, opacity, size, htmlInject?
}

// point
// bar

// count thingy
// rectangle (heatmap)

// table
// list of cards

// checkbox thingy
// organ man

// version 1.
// bar charts
// scatterplots
// tables
// filter panel

export interface ParsedUDIGrammar {
  dataSource: DataSource[];
  dataTransformations?: DataTransformation[];
  dataRepresentation: GoGComponent[] | CustomComponent;
}

export function parseSpecification(spec: UDIGrammar): ParsedUDIGrammar {
  let { dataSource, dataTransformations, dataRepresentation } = spec;
  if (!Array.isArray(dataSource)) {
    dataSource = [dataSource];
  }
  if (
    !Array.isArray(dataRepresentation) &&
    dataRepresentation.type === 'GoGComponent'
  ) {
    dataRepresentation = [dataRepresentation as GoGComponent];
  }
  if (dataTransformations) {
    return { dataSource, dataTransformations, dataRepresentation };
  }

  return { dataSource, dataRepresentation };
}
