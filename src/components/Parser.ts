export interface UDIGrammar {
  source: DataSource | DataSource[];
  transformations?: DataTransformation[];
  representation: Representation | Representations;
}

export interface DataSource {
  name: string;
  source: string; // url of csv for now
}

export type DataTransformation =
  | GroupBy
  | RollUp
  | Join
  | OrderBy
  | Derive
  | Filter; // TODO: expand transformations

interface DataTransformationBase {
  in?: string | [string, string]; // name of input table(s)
  // If no name is specified, it assumes the output of the previous operation.
  out?: string; // name of output table
}

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

export interface Filter extends DataTransformationBase {
  in?: string;
  filter: TableExpression;
}

export type TableExpression = string; // TODO: can/should we support more types like arquero?

export interface AggregateFunction {
  op: 'count' | 'mean' | 'min' | 'max' | 'median' | 'frequency';
  field?: 'string';
}

export type Representation = VisualizationLayer | RowLayer;
export type Representations = VisualizationLayer[] | RowLayer[];

export type DataTypes = 'quantitative' | 'ordinal' | 'nominal';

export interface GenericLayer<Mark, Mapping> {
  mark: Mark;
  mapping: Mapping | Mapping[];
}
export interface GenericFieldMapping<Encoding> {
  encoding: Encoding;
  field: string;
  type: DataTypes;
}
export interface GenericValueMapping<Encoding> {
  encoding: Encoding;
  value: string | number;
}
export type VisualizationLayer =
  | LineLayer
  | AreaLayer
  | GeometryLayer
  | RectLayer
  | BarLayer
  | PointLayer
  | TextLayer;

// Mark = arc
export type ArcEncodingOptions =
  | 'theta'
  | 'theta2'
  | 'radius'
  | 'radius2'
  | 'color';
export type ArcLayer = GenericLayer<'arc', ArcMapping>;
export type ArcMapping = ArcFieldMapping | ArcValueMapping;
export type ArcFieldMapping = GenericFieldMapping<ArcEncodingOptions>;
export type ArcValueMapping = GenericValueMapping<ArcEncodingOptions>;
// Mark = text
export type TextEncodingOptions =
  | 'x'
  | 'y'
  | 'color'
  | 'text'
  | 'size'
  | 'theta'
  | 'radius';
export type TextLayer = GenericLayer<'text', TextMapping>;
export type TextMapping = TextFieldMapping | TextValueMapping;
export type TextFieldMapping = GenericFieldMapping<TextEncodingOptions>;
export type TextValueMapping = GenericValueMapping<TextEncodingOptions>;
// Mark = line
export type LineEncodingOptions = 'x' | 'y' | 'color';
export type LineLayer = GenericLayer<'line', LineMapping>;
export type LineMapping = LineFieldMapping | LineValueMapping;
export type LineFieldMapping = GenericFieldMapping<LineEncodingOptions>;
export type LineValueMapping = GenericValueMapping<LineEncodingOptions>;
// Mark = area
export type AreaEncodingOptions = 'x' | 'y' | 'y2' | 'color' | 'stroke';
export type AreaLayer = GenericLayer<'area', AreaMapping>;
export type AreaMapping = AreaFieldMapping | AreaValueMapping;
export type AreaFieldMapping = GenericFieldMapping<AreaEncodingOptions>;
export type AreaValueMapping = GenericValueMapping<AreaEncodingOptions>;
// Mark = geometry
export type GeometryEncodingOptions = 'color' | 'stroke' | 'strokeWidth';
export type GeometryLayer = GenericLayer<'geometry', GeometryMapping>;
export type GeometryMapping = GeometryFieldMapping | GeometryValueMapping;
export type GeometryFieldMapping = GenericFieldMapping<GeometryEncodingOptions>;
export type GeometryValueMapping = GenericValueMapping<GeometryEncodingOptions>;
// Mark = rect
export type RectEncodingOptions = 'x' | 'x2' | 'y' | 'y2' | 'color';
export type RectLayer = GenericLayer<'rect', RectMapping>;
export type RectMapping = RectFieldMapping | RectValueMapping;
export type RectFieldMapping = GenericFieldMapping<RectEncodingOptions>;
export type RectValueMapping = GenericValueMapping<RectEncodingOptions>;
// Mark = bar
export type BarEncodingOptions =
  | 'x'
  | 'x2'
  | 'y'
  | 'y2'
  | 'xOffset'
  | 'yOffset'
  | 'color';
export type BarLayer = GenericLayer<'bar', BarMapping>;
export type BarMapping = BarFieldMapping | BarValueMapping;
export type BarFieldMapping = GenericFieldMapping<BarEncodingOptions>;
export type BarValueMapping = GenericValueMapping<BarEncodingOptions>;
// Mark = point
export type PointEncodingOptions =
  | 'x'
  | 'y'
  | 'xOffset'
  | 'yOffset'
  | 'color'
  | 'size'
  | 'shape';
export type PointLayer = GenericLayer<'point', PointMapping>;
export type PointMapping = PointFieldMapping | PointValueMapping;
export type PointFieldMapping = GenericFieldMapping<PointEncodingOptions>;
export type PointValueMapping = GenericValueMapping<PointEncodingOptions>;

// Mark = row
// The pattern for Rows is intentionally different from other marks
export type RowEncodingOptions =
  | 'text'
  | 'x'
  | 'y'
  | 'xOffset'
  | 'yOffset'
  | 'color'
  | 'size'
  | 'shape';
export type RowMarkOptions =
  | 'select'
  | 'text'
  | 'geometry'
  | 'point'
  | 'bar'
  | 'rect'
  | 'line';
// TODO: there are some invalid mark/encoding combinations here. Maybe that's ok though.
export type RowLayer = GenericLayer<'row', RowMapping>;
export interface RowMapping extends GenericFieldMapping<RowEncodingOptions> {
  mark: RowMarkOptions;
}
//

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
