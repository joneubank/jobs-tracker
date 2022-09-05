import { JobEvent } from '../event/types';

export enum JobStatus {
  Scheduled = 'Scheduled',
  Queued = 'Queued',
  Running = 'Running',
  Completed = 'Completed',
  Canceled = 'Canceled',
  Error = 'Error',
  Abandoned = 'Abandoned',
}

export type JobDefinition = {
  service: string;
  name: string;
  id: string;
};

export type JobProgress = {
  percent: number;
  data?: Record<string, string | number | boolean | undefined>;
};

export type JobInputs = Record<string, string | number | boolean | undefined>;

export interface Job extends JobDefinition {
  // _id: never; // Confirms that this job isn't an ES or MongoDB document
  status: JobStatus;

  node?: string;

  inputs: JobInputs;

  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  errorAt?: Date;

  scheduledStartTime?: Date;

  progress: JobProgress;
  events: JobEvent[];
  error?: string;
}
