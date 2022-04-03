import { JobEvent } from 'data-model/dist/event/types';
import { JobDefinition, JobInputs, JobStatus } from 'data-model/dist/job/types';

export type JobOptions = { node?: string; inputs?: Record<string, string | number | boolean | Date | undefined> };

export class TrackedJob {
  definition: JobDefinition;
  node?: string;
  inputs?: JobInputs;

  constructor(definition: JobDefinition, options: JobOptions = {}) {
    this.definition = definition;
    this.node = options.node;
  }
}
