export interface UDIGrammar {
  dataSource: DataSource | DataSource[];
  dataTransformations?: DataTransformation[];
  dataRepresentation: GoGComponent | GoGComponent[] | CustomComponent;
}

export interface DataSource {
  key: string;
  source: string; // url of csv for now
}

export interface DataTransformation {
  // join
  // group
  // aggregate
  // select
  // filter
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

export interface TableComponent extends Component {}

export interface FilterPanelComponent extends Component {}

export interface OrganMapComponent extends Component {}

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
