import type {
  UDIGrammar,
  DataSource,
  DataTransformation,
  Representations,
} from './GrammarTypes';

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
  let { source, representation } = spec;
  const { transformation } = spec;
  if (!Array.isArray(source)) {
    source = [source];
  }
  if (!representation) {
    // Default repesentation
    representation = {
      mark: 'row',
      mapping: [
        {
          mark: 'text',
          encoding: 'text',
          field: '*',
          type: 'nominal',
        },
      ],
    };
  }
  if (!Array.isArray(representation)) {
    representation = [representation] as Representations;
  }
  if (transformation) {
    return { source, transformation, representation };
  }

  return { source, representation };
}
