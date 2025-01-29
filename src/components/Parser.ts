export interface UDIGrammar {
  dataSource: DataSource | DataSource[];
  dataTransformations?: DataTransformation[];
  dataRepresentation: GoGComponent | GoGComponent[] | CustomComponent;
}

export interface DataSource {
  key: string;
  source: string; // url of csv for now
}

export type DataTransformation = GroupBy | RollUp | Join | OrderBy | Derive; // TODO: expand transformations

interface DataTransformationBase {
  in?: string | [string, string]; // key of input table(s)
  // If no key is specified, it assumes the output of the previous operation.
  out?: string; // key of output table
}

// ideally in/out could be assumed and ommitted.

export interface GroupBy extends DataTransformationBase {
  in?: string;
  groupby: string | string[];
}

export interface RollUp extends DataTransformationBase {
  in?: string;
  rollup: {
    [outputName: string]: AggregateFunction;
  };
}

export interface OrderBy extends DataTransformationBase {
  in?: string;
  orderby: string; // TODO: probably should support list of strings
}

export interface Join extends DataTransformationBase {
  in: [string, string];
  join: {
    on: string | [string, string];
  };
}

export interface Derive extends DataTransformationBase {
  in?: string;
  derive: TableExpression;
}

export type TableExpression = string; // TODO: can/should we support more types like arquero?

export interface AggregateFunction {
  op: 'count' | 'mean' | 'min' | 'max' | 'median' | 'frequency';
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
  // point, bar, text, tect
}

export interface Encoding {
  // x,y,color, xOffset, yOffset, x2,y2, text
  // line, opacity, size
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
