/**
 * The Universal Discovery Interface (UDI) Grammar.
 */
export interface UDIGrammar {
  /**
   * The data source or data sources.
   * Typically, this is a path to a single CSV file or a list of CSV files.
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
 * A single tabular data source. Currently, only CSV files are accepted.
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
 * These transformations include operations like grouping, filtering, joining, and more.
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
 * Base interface for all data transformations.
 * All data transformations have one or two input tables and one output table.
 */
interface DataTransformationBase {
  /**
   * The name of the input table or tables that match the name of the data source.
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
 * Groups data by specified fields.
 */
export interface GroupBy extends DataTransformationBase {
  /**
   * The name of the input table that matches the name of the data source.
   * If no table name is specified, it assumes the output of the previous operation.
   */
  in?: string;

  /**
   * The field or fields to group by.
   */
  groupby: string | string[];
}

/**
 * Bins data into intervals for a specified field.
 */
export interface BinBy extends DataTransformationBase {
  /**
   * The name of the input table that matches the name of the data source.
   * If no table name is specified, it assumes the output of the previous operation.
   */
  in?: string;

  /**
   * Configuration for binning the data.
   */
  binby: {
    /**
     * The field to bin.
     */
    field: string;

    /**
     * The number of bins to create. Optional.
     */
    bins?: number;

    /**
     * Whether to use "nice" bin boundaries. Optional.
     */
    nice?: boolean;

    /**
     * Output field names for the bin start and end. Optional.
     */
    output?: {
      bin_start?: string;
      bin_end?: string;
    };
  };
}

/**
 * Aggregates data by applying specified functions to groups.
 */
export interface RollUp extends DataTransformationBase {
  /**
   * The name of the input table that matches the name of the data source.
   * If no table name is specified, it assumes the output of the previous operation.
   */
  in?: string;

  /**
   * A mapping of output field names to aggregate functions.
   */
  rollup: {
    [outputName: string]: AggregateFunction;
  };
}

/**
 * Orders data by a specified field or fields.
 */
export interface OrderBy extends DataTransformationBase {
  /**
   * The name of the input table that matches the name of the data source.
   * If no table name is specified, it assumes the output of the previous operation.
   */
  in?: string;

  /**
   * The field or fields to order by.
   */
  orderby: string; // TODO: probably should support list of strings
}

/**
 * Joins two tables based on a specified condition.
 */
export interface Join extends DataTransformationBase {
  /**
   * The names of the two input tables to join.
   */
  in: [string, string];

  /**
   * Configuration for the join operation.
   */
  join: {
    /**
     * The field or fields to join on.
     */
    on: string | [string, string];
  };
}

/**
 * Applies Kernel Density Estimation (KDE) to a specified field.
 */
export interface KDE extends DataTransformationBase {
  /**
   * The name of the input table that matches the name of the data source.
   * If no table name is specified, it assumes the output of the previous operation.
   */
  in?: string;

  /**
   * Configuration for the KDE operation.
   */
  kde: {
    /**
     * The field to apply KDE to.
     */
    field: string;

    /**
     * The bandwidth for the KDE. Optional.
     */
    bandwidth?: number;

    /**
     * The number of samples to generate. Optional.
     */
    samples?: number;

    /**
     * Output field names for the KDE results. Optional.
     */
    output?: {
      sample?: string;
      density?: string;
    };
  };
}

/**
 * Derives new fields based on expressions.
 */
export interface Derive extends DataTransformationBase {
  /**
   * The name of the input table that matches the name of the data source.
   * If no table name is specified, it assumes the output of the previous operation.
   */
  in?: string;

  /**
   * A mapping of output field names to derive expressions.
   */
  derive: {
    [outputName: string]: DeriveExpression;
  };
}

/**
 * Filters data based on a specified condition or selection.
 */
export interface Filter extends DataTransformationBase {
  /**
   * The name of the input table that matches the name of the data source.
   * If no table name is specified, it assumes the output of the previous operation.
   */
  in?: string;

  /**
   * The filter condition or selection.
   */
  filter: FilterExpression;
}

/**
 * A filter expression, which can be a string or a data selection.
 */
export type FilterExpression = string | FilterDataSelection;

/**
 * A data selection used for filtering.
 */
export interface FilterDataSelection {
  /**
   * The name of the selection.
   */
  name: string;

  /**
   * In the case where the selection is applied across a 1-to-many mapping,
   * this specifies if filter should use 'all' or 'any' of the selected data.
   * Default is 'any'.
   */
  match?: 'all' | 'any';
}

/**
 * A derive expression, which can be a string or a rolling derive expression.
 */
export type DeriveExpression = string | RollingDeriveExpression;

/**
 * A rolling derive expression for creating new fields based on a rolling window.
 */
export interface RollingDeriveExpression {
  /**
   * Configuration for the rolling derive expression.
   */
  rolling: {
    /**
     * The expression to apply.
     */
    expression: string;

    /**
     * The rolling window size. Optional.
     */
    window?: [number, number];
  };
}

/**
 * An aggregate function for summarizing data.
 */
export interface AggregateFunction {
  /**
   * The operation to apply (e.g., count, sum, mean, etc.).
   */
  op: 'count' | 'sum' | 'mean' | 'min' | 'max' | 'median' | 'frequency';

  /**
   * The field to aggregate. Optional.
   */
  field?: string;
}

/**
 * A visual representation of the data, such as a chart or table.
 */
export type Representation = VisualizationLayer | RowLayer;

/**
 * A list of visual representations, charts and tables cannot be intermixed.
 */
export type Representations = VisualizationLayer[] | RowLayer[];

/**
 * The possible data types for fields.
 */
export type DataTypes = 'quantitative' | 'ordinal' | 'nominal';

/**
 * A generic layer for visualizing data.
 * @template Mark - The type of mark (e.g., line, bar, point).
 * @template Mapping - The type of mapping for the layer.
 */
export interface GenericLayer<Mark, Mapping> {
  /**
   * The type of mark used in the layer.
   */
  mark: Mark;

  /**
   * The mapping of data fields or values to visual encodings.
   */
  mapping: Mapping | Mapping[];

  /**
   * The data selection configuration for the layer. Optional.
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
