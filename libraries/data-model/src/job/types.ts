import { JobEvent } from '../event/types';

export enum JobStatus {
  Scheduled = 'Scheduled',
  Queued = 'Queued',
  Running = 'Running',
  Completed = 'Completed',
  Canceled = 'Canceled',
  Error = 'Error',
}

export type JobDefinition = {
  service: string;
  name: string;
  id: string;
};

export type JobProgress = {
  percent: number;
  data?: object;
};

export type JobInputs = Record<string, string | number | boolean | undefined>;

export type Job = JobDefinition & {
  status: JobStatus;

  node?: string;

  inputs: JobInputs;

  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  errorAt?: Date;

  scheduledStartTime?: Date;

  progress: JobProgress;
  updates: JobEvent[];
  errors: string[];

  abandoned: boolean;
};
