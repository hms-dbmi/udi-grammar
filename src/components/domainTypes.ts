/**
 * Public types for the loadDataPackage / domain-computation pipeline.
 *
 * These shapes are part of udi-toolkit's exported surface — consumers
 * (udi-chat-react today) import DataFieldDomain etc. via udi-toolkit/react.
 */

export interface IntervalDomain {
  min: number;
  max: number;
}

export interface CategoricalDomain {
  values: string[];
}

export interface DataFieldDomain {
  entity: string;
  field: string;
  type: 'interval' | 'point';
  domain: IntervalDomain | CategoricalDomain;
  fieldDescription: string;
}

// ── Worker protocol (internal, but co-located so the worker and the
//    orchestrator share one source of truth) ────────────────────────────

/** One column's raw values, extracted on the main thread from Arquero. */
export interface ColumnInput {
  name: string;
  values: unknown[];
}

/** Per-entity payload sent to the worker for domain computation. */
export interface EntityComputeInput {
  entityName: string;
  fieldDescriptions: Record<string, string>;
  columns: ColumnInput[];
}

export interface ComputeDomainsRequest {
  type: 'compute';
  resources: EntityComputeInput[];
}

export interface EntityDomainsResult {
  type: 'entity-domains';
  entityName: string;
  domains: DataFieldDomain[];
}

export interface DoneResult {
  type: 'done';
}

export interface ErrorResult {
  type: 'error';
  entityName: string;
  message: string;
}

export type WorkerMessage = ComputeDomainsRequest;
export type WorkerResponse = EntityDomainsResult | DoneResult | ErrorResult;
