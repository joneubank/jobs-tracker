import { Job, JobEvent } from 'data-model';
import { Result } from 'optionals';

export * from './kafka';
// export * from './rest';

export interface JobTrackerExternalClient {
  sendJobEvent: (event: JobEvent) => Promise<void>;
}
