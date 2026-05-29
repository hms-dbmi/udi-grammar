/**
 * Web Worker entry: dispatches incoming compute requests to the pure
 * domain-computation logic in domainCompute.ts and streams results back.
 *
 * Top-level `self` access means this module must only be loaded inside a
 * worker context (via `?worker&inline`). The main-thread fallback path
 * imports computeEntityDomains directly from domainCompute.ts instead.
 *
 * Message protocol:
 *   Main → Worker:  ComputeDomainsRequest  (one message; batched resources)
 *   Worker → Main:  EntityDomainsResult     (one per resource, streamed)
 *   Worker → Main:  DoneResult | ErrorResult (termination)
 */

import { computeEntityDomains } from './domainCompute';
import type {
  WorkerMessage,
  WorkerResponse,
  EntityDomainsResult,
  DoneResult,
  ErrorResult,
} from './domainTypes';

const workerSelf = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerMessage>) => void) | null;
  postMessage: (msg: WorkerResponse) => void;
};

workerSelf.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;
  if (msg.type !== 'compute') return;

  for (const resource of msg.resources) {
    try {
      const domains = computeEntityDomains(resource);
      const response: EntityDomainsResult = {
        type: 'entity-domains',
        entityName: resource.entityName,
        domains,
      };
      workerSelf.postMessage(response);
    } catch (e) {
      const response: ErrorResult = {
        type: 'error',
        entityName: resource.entityName,
        message: e instanceof Error ? e.message : String(e),
      };
      workerSelf.postMessage(response);
    }
  }

  workerSelf.postMessage({ type: 'done' } satisfies DoneResult);
};
