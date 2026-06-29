/// <reference types="vite/client" />

/**
 * Public API: loadDataPackage()
 *
 * Fetches each declared CSV exactly once, seeds the shared DataSourcesStore
 * (so subsequent <udi-vis> / queryData calls reuse the parsed table), and
 * runs per-column domain computation off the main thread in a Web Worker.
 *
 * The orchestrator is the single entry point for callers that want both
 * data caching and domain summaries. UDIVis and queryData continue to
 * lazy-load uncached sources on their own — this just primes the cache
 * and surfaces domains.
 */

import type { Pinia } from 'pinia';
import { fromCSV } from 'arquero';
import DomainWorker from './domain-worker?worker&inline';
import { useDataSourcesStore } from './DataSourcesStore';
import { computeEntityDomains } from './domainCompute';
import type {
  DataFieldDomain,
  EntityComputeInput,
  WorkerResponse,
} from './domainTypes';

export interface SourceSpec {
  /** Entity name, used as the DataSourcesStore key. */
  name: string;
  /** Resolved URL of the CSV/TSV file. */
  url: string;
  /** Override the delimiter; defaults to '\t' for .tsv URLs, ',' otherwise. */
  delimiter?: string;
  /** Optional per-field human descriptions, passed through into domains. */
  fieldDescriptions?: Record<string, string>;
}

export interface LoadDataPackageOptions {
  // Each field uses `?: T | undefined` (rather than `?: T`) so callers
  // under `exactOptionalPropertyTypes: true` can spread an explicit
  // `undefined` (`fetchOptions: cfg.fetchOptions`) without TS rejecting
  // it. The behavior is identical at runtime — the loader checks each
  // field with optional chaining.
  /** Forwarded to fetch() for each CSV request. */
  fetchOptions?: RequestInit | undefined;
  /** Called once per entity when its domains have been computed. */
  onEntityDomains?: ((entityName: string, domains: DataFieldDomain[]) => void) | undefined;
  /** Called when an individual source fails (others continue). */
  onError?: ((entityName: string, message: string) => void) | undefined;
}

function inferDelimiter(spec: SourceSpec): string {
  if (spec.delimiter) return spec.delimiter;
  return spec.url.endsWith('.tsv') ? '\t' : ',';
}

/**
 * Fetch + parse + seed + compute domains for a batch of sources.
 * Resolves once all sources have been processed.
 */
export async function loadDataPackage(
  pinia: Pinia,
  sources: SourceSpec[],
  options?: LoadDataPackageOptions,
): Promise<void> {
  const store = useDataSourcesStore(pinia);
  const inputs: EntityComputeInput[] = [];

  for (const spec of sources) {
    try {
      const response = await fetch(spec.url, options?.fetchOptions);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const csvText = await response.text();
      const delimiter = inferDelimiter(spec);
      const table = fromCSV(csvText, { delimiter });

      store.seedDataSource(spec.name, spec.url, table);

      inputs.push({
        entityName: spec.name,
        fieldDescriptions: spec.fieldDescriptions ?? {},
        columns: table
          .columnNames()
          .map((name) => ({ name, values: table.array(name) as unknown[] })),
      });
    } catch (e) {
      options?.onError?.(
        spec.name,
        e instanceof Error ? e.message : String(e),
      );
    }
  }

  if (inputs.length === 0) return;

  try {
    await computeDomainsInWorker(inputs, options);
  } catch {
    computeDomainsMainThread(inputs, options);
  }
}

function computeDomainsInWorker(
  inputs: EntityComputeInput[],
  options?: LoadDataPackageOptions,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new DomainWorker();
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
      return;
    }

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      if (msg.type === 'entity-domains') {
        options?.onEntityDomains?.(msg.entityName, msg.domains);
      } else if (msg.type === 'error') {
        options?.onError?.(msg.entityName, msg.message);
      } else if (msg.type === 'done') {
        worker.terminate();
        resolve();
      }
    };

    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || 'Worker error'));
    };

    worker.postMessage({ type: 'compute', resources: inputs });
  });
}

function computeDomainsMainThread(
  inputs: EntityComputeInput[],
  options?: LoadDataPackageOptions,
): void {
  for (const input of inputs) {
    try {
      const domains = computeEntityDomains(input);
      options?.onEntityDomains?.(input.entityName, domains);
    } catch (e) {
      options?.onError?.(
        input.entityName,
        e instanceof Error ? e.message : String(e),
      );
    }
  }
}
