import { EventType, JobDefinition, JobInputs } from 'data-model';

import { JobTrackerExternalClient } from './external';

// TODO: some solution for state tracking and checking
export class TrackedJob {
  client: JobTrackerExternalClient;
  definition: JobDefinition;
  node?: string;
  inputs?: JobInputs;

  constructor(
    client: JobTrackerExternalClient,
    definition: JobDefinition,
    options: { inputs?: JobInputs; node?: string } = {},
  ) {
    this.client = client;
    this.definition = definition;
    this.node = options.node;
    this.inputs = options.inputs;

    this.client.sendJobEvent({
      ...this.definition,
      node: this.node,
      eventTime: new Date(),
      type: EventType.Start,
      inputs: this.inputs,
    });
  }

  cancel = () => {
    this.client.sendJobEvent({
      ...this.definition,
      node: this.node,
      eventTime: new Date(),
      type: EventType.Cancel,
    });
  };

  complete = () => {
    this.client.sendJobEvent({
      ...this.definition,
      node: this.node,
      eventTime: new Date(),
      type: EventType.Complete,
    });
  };

  error = (error: string) => {
    this.client.sendJobEvent({
      ...this.definition,
      node: this.node,
      eventTime: new Date(),
      type: EventType.Error,
      error,
    });
  };

  progress = (percent: number, data?: Record<string, string | number | boolean | undefined>) => {
    this.client.sendJobEvent({
      ...this.definition,
      node: this.node,
      eventTime: new Date(),
      type: EventType.Progress,
      progress: { percent, data },
    });
  };
}
