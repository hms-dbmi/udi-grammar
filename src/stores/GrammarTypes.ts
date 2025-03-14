/**
 * The Universal Discovery Interface (UDI) Grammar.
 */
export interface UDIGrammar {
  /**
   * The data source or data sources.
   * Typically this is a path to a single csv file or a list of csv files.
   */
  source: DataSource | DataSource[];

  /**
   * The data transformations applied to the source data before displaying
   * the data.
   */
  transformation?: DataTransformation[];

  /**
   * The visual representation of the data as either a visualization or table.
   */
  representation: Representation | Representations;
}

/**
 * A single tabular data source. Currently only csv files are accepted.
 */
export interface DataSource {
  /**
   * The unique name of the data source.
   */
  name: string;

  /**
   * The URL of the CSV file.
   */
  source: string;
}

/**
 * The possible data transformations.
 */
export type DataTransformation =
  | GroupBy
  | BinBy
  | RollUp
  | Join
  | OrderBy
  | Derive
  | Filter
  | KDE;

/**
 * All data transformations have one or two input tables and one output table.
 */
interface DataTransformationBase {
  /**
   * The name of the input table or tables. Which match the name of the data source.
   * If no table name is specified, it assumes the output of the previous operation.
   */
  in?: string | [string, string];

  /**
   * The output name of the table. If no name is specified,
   * it uses the name of the previous table, overwriting it.
   */
  out?: string;
}
/**
 * TODO: Description
 */
export interface GroupBy extends DataTransformationBase {
  /**
   * TODO: Description
   */
  in?: string;

  /**
   * TODO: Description
   */
  groupby: string | string[];
}
/**
 * TODO: Description
 */
export interface BinBy extends DataTransformationBase {
  in?: string;
  binby: {
    field: string;
    bins?: number;
    nice?: boolean;
    output?: {
      bin_start?: string;
      bin_end?: string;
    };
  };
}

/**
 * TODO: Description
 */
export interface RollUp extends DataTransformationBase {
  /**
   * TODO: Description
   */
  in?: string;

  /**
   * TODO: Description
   */
  rollup: {
    [outputName: string]: AggregateFunction;
  };
}

/**
 * TODO: Description
 */
export interface OrderBy extends DataTransformationBase {
  in?: string;
  orderby: string; // TODO: probably should support list of strings
}

/**
 * TODO: Description
 */
export interface Join extends DataTransformationBase {
  /**
   * TODO: Description
   */
  in: [string, string];

  /**
   * TODO: Description
   */
  join: {
    on: string | [string, string];
  };
}

/**
 * TODO: Description
 */
export interface KDE extends DataTransformationBase {
  in?: string;
  kde: {
    field: string;
    bandwidth?: number;
    samples?: number;
    output?: {
      sample?: string;
      density?: string;
    };
  };
}

/**
 * TODO: Description
 */
export interface Derive extends DataTransformationBase {
  /**
   * TODO: Description
   */
  in?: string;

  /**
   * TODO: Description
   */
  derive: {
    [outputName: string]: DeriveExpression;
  };
}

/**
 * TODO: Description
 */
export interface Filter extends DataTransformationBase {
  /**
   * TODO: Description
   */
  in?: string;

  /**
   * TODO: Description
   */
  filter: FilterExpression;
}

/**
 * TODO: Description
 */
export type FilterExpression = string | FilterDataSelection;

export interface FilterDataSelection {
  name: string;
  /**
   * In the case where the selection is applied across a 1-to-many mapping,
   * this specifies if filter should use 'all' or 'any' of the selected data.
   * Default is 'any'.
   */
  match?: 'all' | 'any';
}

export type DeriveExpression = string | RollingDeriveExpression;

/**
 * TODO: Description
 */
export interface RollingDeriveExpression {
  rolling: {
    expression: string;
    window?: [number, number];
  };
}

/**
 * TODO: Description
 */
export interface AggregateFunction {
  /**
   * TODO: Description
   */
  op: 'count' | 'sum' | 'mean' | 'min' | 'max' | 'median' | 'frequency';

  /**
   * TODO: Description
   */
  field?: string;
}

/**
 * TODO: Description
 */
export type Representation = VisualizationLayer | RowLayer;

/**
 * TODO: Description
 */
export type Representations = VisualizationLayer[] | RowLayer[];

/**
 * TODO: Description
 */
export type DataTypes = 'quantitative' | 'ordinal' | 'nominal';

/**
 * TODO: Description
 */
export interface GenericLayer<Mark, Mapping> {
  /**
   * TODO: Description
   */
  mark: Mark;

  /**
   * TODO: Description
   */
  mapping: Mapping | Mapping[];

  /**
   * TODO: Description
   */
  select?: DataSelection;
}

/**
 * TODO: Description
 */
export interface GenericFieldMapping<Encoding> {
  /**
   * TODO: Description
   */
  encoding: Encoding;

  /**
   * TODO: Description
   */
  field: string;

  /**
   * TODO: Description
   */
  type: DataTypes;

  /**
   * TODO: Description
   */
}

/**
 * TODO: Description
 */
export interface GenericValueMapping<Encoding> {
  /**
   * TODO: Description
   */
  encoding: Encoding;

  /**
   * TODO: Description
   */
  value: string | number;
}

/**
 * TODO: Description
 */
export type VisualizationLayer =
  | LineLayer
  | AreaLayer
  | GeometryLayer
  | RectLayer
  | BarLayer
  | PointLayer
  | TextLayer
  | ArcLayer;

// Mark = arc

/**
 * TODO: Description
 */
export type ArcEncodingOptions =
  | 'theta'
  | 'theta2'
  | 'radius'
  | 'radius2'
  | 'color';

/**
 * TODO: Description
 */
export type ArcLayer = GenericLayer<'arc', ArcMapping>;

/**
 * TODO: Description
 */
export type ArcMapping = ArcFieldMapping | ArcValueMapping;

/**
 * TODO: Description
 */
export type ArcFieldMapping = GenericFieldMapping<ArcEncodingOptions>;

/**
 * TODO: Description
 */
export type ArcValueMapping = GenericValueMapping<ArcEncodingOptions>;
// Mark = text

/**
 * TODO: Description
 */
export type TextEncodingOptions =
  | 'x'
  | 'y'
  | 'color'
  | 'text'
  | 'size'
  | 'theta'
  | 'radius';

/**
 * TODO: Description
 */
export type TextLayer = GenericLayer<'text', TextMapping>;

/**
 * TODO: Description
 */
export type TextMapping = TextFieldMapping | TextValueMapping;

/**
 * TODO: Description
 */
export type TextFieldMapping = GenericFieldMapping<TextEncodingOptions>;

/**
 * TODO: Description
 */
export type TextValueMapping = GenericValueMapping<TextEncodingOptions>;

/**
 * TODO: Description
 */
// Mark = line

/**
 * TODO: Description
 */
export type LineEncodingOptions = 'x' | 'y' | 'color';

/**
 * TODO: Description
 */
export type LineLayer = GenericLayer<'line', LineMapping>;

/**
 * TODO: Description
 */
export type LineMapping = LineFieldMapping | LineValueMapping;

/**
 * TODO: Description
 */
export type LineFieldMapping = GenericFieldMapping<LineEncodingOptions>;

/**
 * TODO: Description
 */
export type LineValueMapping = GenericValueMapping<LineEncodingOptions>;

/**
 * TODO: Description
 */
// Mark = area

/**
 * TODO: Description
 */
export type AreaEncodingOptions =
  | 'x'
  | 'y'
  | 'y2'
  | 'color'
  | 'stroke'
  | 'opacity';

/**
 * TODO: Description
 */
export type AreaLayer = GenericLayer<'area', AreaMapping>;

/**
 * TODO: Description
 */
export type AreaMapping = AreaFieldMapping | AreaValueMapping;

/**
 * TODO: Description
 */
export type AreaFieldMapping = GenericFieldMapping<AreaEncodingOptions>;

/**
 * TODO: Description
 */
export type AreaValueMapping = GenericValueMapping<AreaEncodingOptions>;
// Mark = geometry

/**
 * TODO: Description
 */
export type GeometryEncodingOptions = 'color' | 'stroke' | 'strokeWidth';

/**
 * TODO: Description
 */
export type GeometryLayer = GenericLayer<'geometry', GeometryMapping>;

/**
 * TODO: Description
 */
export type GeometryMapping = GeometryFieldMapping | GeometryValueMapping;

/**
 * TODO: Description
 */
export type GeometryFieldMapping = GenericFieldMapping<GeometryEncodingOptions>;

/**
 * TODO: Description
 */
export type GeometryValueMapping = GenericValueMapping<GeometryEncodingOptions>;
// Mark = rect

/**
 * TODO: Description
 */
/**
 * TODO: Description
 */
export type RectEncodingOptions = 'x' | 'x2' | 'y' | 'y2' | 'color';

/**
 * TODO: Description
 */
export type RectLayer = GenericLayer<'rect', RectMapping>;

/**
 * TODO: Description
 */
export type RectMapping = RectFieldMapping | RectValueMapping;

/**
 * TODO: Description
 */
export type RectFieldMapping = GenericFieldMapping<RectEncodingOptions>;

/**
 * TODO: Description
 */
export type RectValueMapping = GenericValueMapping<RectEncodingOptions>;
// Mark = bar

/**
 * TODO: Description
 */
export type BarEncodingOptions =
  | 'x'
  | 'x2'
  | 'y'
  | 'y2'
  | 'xOffset'
  | 'yOffset'
  | 'color';

/**
 * TODO: Description
 */
export type BarLayer = GenericLayer<'bar', BarMapping>;

/**
 * TODO: Description
 */
export type BarMapping = BarFieldMapping | BarValueMapping;

/**
 * TODO: Description
 */
export type BarFieldMapping = GenericFieldMapping<BarEncodingOptions>;

/**
 * TODO: Description
 */
export type BarValueMapping = GenericValueMapping<BarEncodingOptions>;
// Mark = point

/**
 * TODO: Description
 */
export type PointEncodingOptions =
  | 'x'
  | 'y'
  | 'xOffset'
  | 'yOffset'
  | 'color'
  | 'size'
  | 'shape';
export type PointLayer = GenericLayer<'point', PointMapping>;

/**
 * TODO: Description
 */
export type PointMapping = PointFieldMapping | PointValueMapping;

/**
 * TODO: Description
 */
export type PointFieldMapping = GenericFieldMapping<PointEncodingOptions>;

/**
 * TODO: Description
 */
export type PointValueMapping = GenericValueMapping<PointEncodingOptions>;

// Mark = row
// The pattern for Rows is intentionally different from other marks

/**
 * TODO: Description
 */
export type RowEncodingOptions =
  | 'text'
  | 'x'
  | 'y'
  | 'xOffset'
  | 'yOffset'
  | 'color'
  | 'size'
  | 'shape';

/**
 * TODO: Description
 */
export type RowMarkOptions =
  | 'select'
  | 'text'
  | 'geometry'
  | 'point'
  | 'bar'
  | 'rect'
  | 'line';
// TODO: there are some invalid mark/encoding combinations here. Maybe that's ok though.

/**
 * TODO: Description
 */
export type RowLayer = GenericLayer<'row', RowMapping>;

/**
 * TODO: Description
 */
export interface RowMapping extends GenericFieldMapping<RowEncodingOptions> {
  /**
   * TODO: Description
   */
  mark: RowMarkOptions;
}
//
export interface DataSelection {
  name: string;
  /**
   * How the data is selected in the visualization / table.
   */
  how: DataSelectionInterval | DataSelectionPoint;
  /**
   * The fields selected from the data points. If not specified, all fields are selected.
   */
  fields?: string | string[];
}

export interface DataSelectionInterval {
  type: 'interval';
  on: 'x' | 'y' | 'xy';
}

export interface DataSelectionPoint {
  type: 'point';
}
