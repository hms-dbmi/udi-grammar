import type {
  UDIGrammar,
  DataSource,
  DataTransformation,
  Representations,
  Representation,
} from '../stores/GrammarTypes';

export interface ParsedUDIGrammar {
  source: DataSource[];
  transformation?: DataTransformation[];
  representation: Representations;
}

/**
 * Convenience function to simplify the specification
 * to ensure that source and representation are always arrays
 */
export function parseSpecification(spec: UDIGrammar): ParsedUDIGrammar {
  let { source, transformation, representation } = spec;
  if (!Array.isArray(source)) {
    source = [source];
  }
  if (!Array.isArray(representation)) {
    representation = [representation] as Representations;
  }
  if (transformation) {
    return { source, transformation, representation };
  }

  return { source, representation };
}
