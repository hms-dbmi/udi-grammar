import type { UDIGrammar } from "src/components/GrammarTypes";

export interface Example {
  name: string;
  spec: UDIGrammar;
  description?: string;
  thumbnail?: string;
}

export interface ExampleGroup {
  name: string;
  examples: Example[];
  description?: string;
}
