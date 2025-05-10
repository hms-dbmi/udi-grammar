/**
 * The Universal Discovery Interface (UDI) Grammar.
 */
export interface UDIGrammar {
  /**
   * The data source or data sources.
   * This can be a single CSV file or a list of CSV files.
   */
  source: DataSource | DataSource[];

  /**
   * The data transformations applied to the source data before displaying
   * the data.
   */
  transformation?: DataTransformation[];

  /**
   * The visual representation of the data as either a visualization or table.
   * If not specificed the default is a table witha all fields.
   */
  representation?: Representation | Representations;
}

/**
 * A single tabular data source. Currently, only CSV files are supported.
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
 * These include operations like grouping, filtering, joining, and more.
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
 * All transformations operate on one or two input tables and produce one output table.
 */
interface DataTransformationBase {
  /**
   * The name of the input table(s) that match the data source name.
   * If not specified, it assumes the output of the previous operation.
   */
  in?: string | [string, string];

  /**
   * The name of the output table.
   * If not specified, it overwrites the name of the previous table.
   */
  out?: string;
}

/**
 * Groups data by specified fields.
 */
export interface GroupBy extends DataTransformationBase {
  /**
   * The name of the input table.
   * If not specified, it assumes the output of the previous operation.
   */
  in?: string;

  /**
   * The field(s) to group by.
   */
  groupby: string | string[];
}

/**
 * Bins data into intervals for a specified field.
 */
export interface BinBy extends DataTransformationBase {
  /**
   * The name of the input table.
   * If not specified, it assumes the output of the previous operation.
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
   * The name of the input table.
   * If not specified, it assumes the output of the previous operation.
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
   * The name of the input table.
   * If not specified, it assumes the output of the previous operation.
   */
  in?: string;

  /**
   * The field(s) to order by, default in ascending order.
   */
  orderby: string | DirectionalOrder | (string | DirectionalOrder)[];
}

/**
 * Defines a sorting order and a field to sort by.
 */
export interface DirectionalOrder {
  /**
   * The name of the field to be sorted.
   */
  field: string;

  /**
   * The sorting order for the field, either ascending ('asc') or descending ('desc').
   */
  order: 'asc' | 'desc';
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
     * The field(s) to join on. If one field is specified, it's assumed to be the same in both tables.
     * If two fields are specified, the first field is from the first table and the second field is from the second table.
     */
    on: string | [string, string] | [string[], string[]];
  };
}

/**
 * Applies Kernel Density Estimation (KDE) to a specified field.
 */
export interface KDE extends DataTransformationBase {
  /**
   * The name of the input table.
   * If not specified, it assumes the output of the previous operation.
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
   * The name of the input table.
   * If not specified, it assumes the output of the previous operation.
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
   * The name of the input table.
   * If not specified, it assumes the output of the previous operation.
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
   * Specifies whether to use 'all' or 'any' of the selected data in a 1-to-many mapping.
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
 * A list of visual representations.
 * Charts and tables cannot be intermixed.
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
 * A generic field mapping for visual encodings.
 * @template Encoding - The type of encodings supported (e.g., x, y, color).
 */
export interface GenericFieldMapping<Encoding> {
  /**
   * The encoding type (e.g., x, y, color).
   */
  encoding: Encoding;

  /**
   * The field to map to the encoding.
   */
  field: string;

  /**
   * The data type of the field (e.g., quantitative, ordinal, nominal).
   */
  type: DataTypes;

  /**
   * The custom domain will change the scaling of visual encodings.
   */
  domain?: Domain;

  /**
   * The custom range will change the scaling of visual encodings.
   */
  range?: Domain;

  /**
   * Set to true to omit the legend for this encoding.
   */
  omitLegend?: boolean;
}

/**
 * A generic value mapping for visual encodings.
 * @template Encoding - The type of encoding (e.g., x, y, color).
 */
export interface GenericValueMapping<Encoding> {
  /**
   * The encoding type (e.g., x, y, color).
   */
  encoding: Encoding;

  /**
   * The value to map to the encoding.
   */
  value: string | number;
}

/**
 * A visualization layer for rendering data.
 * This can include various types of marks such as lines, bars, points, etc.
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

/**
 * Encoding options for arc marks.
 */
export type ArcEncodingOptions =
  | 'theta'
  | 'theta2'
  | 'radius'
  | 'radius2'
  | 'color';

/**
 * A layer for rendering arc marks.
 */
export type ArcLayer = GenericLayer<'arc', ArcMapping>;

/**
 * The mapping for arc marks.
 */
export type ArcMapping = ArcFieldMapping | ArcValueMapping;

/**
 * A field mapping for arc marks.
 */
export type ArcFieldMapping = GenericFieldMapping<ArcEncodingOptions>;

/**
 * A value mapping for arc marks.
 */
export type ArcValueMapping = GenericValueMapping<ArcEncodingOptions>;

/**
 * Encoding options for text marks.
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
 * A layer for rendering text marks.
 */
export type TextLayer = GenericLayer<'text', TextMapping>;

/**
 * The mapping for text marks.
 */
export type TextMapping = TextFieldMapping | TextValueMapping;

/**
 * A field mapping for text marks.
 */
export type TextFieldMapping = GenericFieldMapping<TextEncodingOptions>;

/**
 * A value mapping for text marks.
 */
export type TextValueMapping = GenericValueMapping<TextEncodingOptions>;

/**
 * Encoding options for line marks.
 */
export type LineEncodingOptions = 'x' | 'y' | 'color';

/**
 * A layer for rendering line marks.
 */
export type LineLayer = GenericLayer<'line', LineMapping>;

/**
 * The mapping for line marks.
 */
export type LineMapping = LineFieldMapping | LineValueMapping;

/**
 * A field mapping for line marks.
 */
export type LineFieldMapping = GenericFieldMapping<LineEncodingOptions>;

/**
 * A value mapping for line marks.
 */
export type LineValueMapping = GenericValueMapping<LineEncodingOptions>;

/**
 * Encoding options for area marks.
 */
export type AreaEncodingOptions =
  | 'x'
  | 'y'
  | 'y2'
  | 'color'
  | 'stroke'
  | 'opacity';

/**
 * A layer for rendering area marks.
 */
export type AreaLayer = GenericLayer<'area', AreaMapping>;

/**
 * The mapping for area marks.
 */
export type AreaMapping = AreaFieldMapping | AreaValueMapping;

/**
 * A field mapping for area marks.
 */
export type AreaFieldMapping = GenericFieldMapping<AreaEncodingOptions>;

/**
 * A value mapping for area marks.
 */
export type AreaValueMapping = GenericValueMapping<AreaEncodingOptions>;

/**
 * Encoding options for geometry marks.
 */
export type GeometryEncodingOptions = 'color' | 'stroke' | 'strokeWidth';

/**
 * A layer for rendering geometry marks.
 */
export type GeometryLayer = GenericLayer<'geometry', GeometryMapping>;

/**
 * The mapping for geometry marks.
 */
export type GeometryMapping = GeometryFieldMapping | GeometryValueMapping;

/**
 * A field mapping for geometry marks.
 */
export type GeometryFieldMapping = GenericFieldMapping<GeometryEncodingOptions>;

/**
 * A value mapping for geometry marks.
 */
export type GeometryValueMapping = GenericValueMapping<GeometryEncodingOptions>;

/**
 * Encoding options for rect marks.
 */
export type RectEncodingOptions = 'x' | 'x2' | 'y' | 'y2' | 'color';

/**
 * A layer for rendering rect marks.
 */
export type RectLayer = GenericLayer<'rect', RectMapping>;

/**
 * The mapping for rect marks.
 */
export type RectMapping = RectFieldMapping | RectValueMapping;

/**
 * A field mapping for rect marks.
 */
export type RectFieldMapping = GenericFieldMapping<RectEncodingOptions>;

/**
 * A value mapping for rect marks.
 */
export type RectValueMapping = GenericValueMapping<RectEncodingOptions>;

/**
 * Encoding options for bar marks.
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
 * A layer for rendering bar marks.
 */
export type BarLayer = GenericLayer<'bar', BarMapping>;

/**
 * The mapping for bar marks.
 */
export type BarMapping = BarFieldMapping | BarValueMapping;

/**
 * A field mapping for bar marks.
 */
export type BarFieldMapping = GenericFieldMapping<BarEncodingOptions>;

/**
 * A value mapping for bar marks.
 */
export type BarValueMapping = GenericValueMapping<BarEncodingOptions>;

/**
 * Encoding options for point marks.
 */
export type PointEncodingOptions =
  | 'x'
  | 'y'
  | 'xOffset'
  | 'yOffset'
  | 'color'
  | 'size'
  | 'shape';

/**
 * A layer for rendering point marks.
 */
export type PointLayer = GenericLayer<'point', PointMapping>;

/**
 * The mapping for point marks.
 */
export type PointMapping = PointFieldMapping | PointValueMapping;

/**
 * A field mapping for point marks.
 */
export type PointFieldMapping = GenericFieldMapping<PointEncodingOptions>;

/**
 * A value mapping for point marks.
 */
export type PointValueMapping = GenericValueMapping<PointEncodingOptions>;

/**
 * Encoding options for row marks.
 */
export type RowEncodingOptions =
  | 'text'
  | 'x'
  | 'x2'
  | 'y'
  | 'xOffset'
  | 'yOffset'
  | 'color'
  | 'size'
  | 'shape';

// should add x2, y2, textAnchor, maybe theta? maybe rowHeight?

/**
 * Mark options for row layers.
 */
export type RowMarkOptions =
  | 'select'
  | 'text'
  | 'geometry'
  | 'point'
  | 'bar'
  | 'rect'
  | 'line';

/**
 * A layer for rendering row marks.
 */
export type RowLayer = GenericLayer<'row', RowMapping>;

/**
 * The mapping for row marks.
 */
export interface RowMapping extends GenericFieldMapping<RowEncodingOptions> {
  /**
   * The type of mark used in the row layer.
   */
  mark: RowMarkOptions;

  /**
   * The target display column. If empty, the target column is based on the
   * field name. This is needed so that you can construct columns that map multiple
   * fields to the same mark within the column. E.g. a bar where the width is based
   * on a quantitative field and the color is if based on a derived boolean field
   * if the value is positive or negative.
   */
  column?: string;

  /**
   * The custom domain will change the scaling of visual encodings.
   */
  domain?: Domain;

  /**
   * The custom range will change the scaling of visual encodings.
   */
  range?: Domain;

  /**
   * The value to use when sorting by the column in the interface. This
   * will not affect the default sorting of the table.
   * defaults to the field name.
   */
  orderby?: string;
}

/**
 * Represents a numerical domain with a minimum and maximum value.
 */
export interface NumberDomain {
  min: number;
  max: number;
}

/**
 * Field Unions require a list of fields, and the domain is the
 * union of the fields.
 * e.g. If a.domain = [0, 10], b.domain = [5, 15],
 * then the domain is [0, 15].
 */
export interface NumberFieldUnion {
  numberFields: string[];
}

/**
 * Field Unions require a list of fields, and the domain is the
 * union of the fields.
 * Or if a.domain = ['cat', 'dog'], b.domain = ['cat', 'mouse'],
 * then the domain is ['cat', 'dog', 'mouse'].
 */
export interface CategoryFieldUnion {
  categoryFields: string[];
}

/**
 * A union of field types, which can be either numerical or categorical.
 */
export type FieldUnion = NumberFieldUnion | CategoryFieldUnion;

/**
 * Represents a string domain with a list of possible values.
 */
export type StringDomain = string[];

/**
 * Represents a domain for visual encodings.
 * This can be a numerical domain, a string domain, or a field union.
 */
export type Domain = NumberDomain | StringDomain | FieldUnion;

/**
 * Represents a range for visual encodings.
 * This can be a numerical domain, a string domain, or a field union.
 */
export type Range = NumberDomain | StringDomain;

/**
 * Configuration for data selection in visualizations or tables.
 */
export interface DataSelection {
  /**
   * The name of the data selection.
   */
  name: string;

  /**
   * How the data is selected in the visualization / table.
   */
  how: DataSelectionInterval | DataSelectionPoint;

  /**
   * The fields selected from the data points.
   * If not specified, all fields are selected.
   */
  fields?: string | string[];
}

/**
 * Configuration for interval-based data selection.
 */
export interface DataSelectionInterval {
  /**
   * The type of selection (interval).
   */
  type: 'interval';

  /**
   * The axis or axes to apply the selection on ('x', 'y', or both ('xy')).
   */
  on: 'x' | 'y' | 'xy';
}

/**
 * Configuration for point-based data selection.
 */
export interface DataSelectionPoint {
  /**
   * The type of selection (point).
   */
  type: 'point';
}
