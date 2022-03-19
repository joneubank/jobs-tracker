import { JobDefinition } from '../jobs/types';

export enum UpdateType {
  Schedule = 'Schedule',
  Queue = 'Queue',
  Start = 'Start',
  Progress = 'Progress',
  Complete = 'Complete',
  Cancel = 'Cancel',
  Error = 'Error',
}

export type CommonJobEvent = JobDefinition & {
  eventTime: Date;
  type: UpdateType;
};

// Common properties for defining a new job (schedule, queue, start)
export type InitialJobEvent = {
  inputs?: object;
  node?: string;
};

export type ScheduleJobEvent = CommonJobEvent &
  InitialJobEvent & {
    type: UpdateType.Schedule;
    scheduledStartTime: Date;
  };
export type QueueJobEvent = CommonJobEvent &
  InitialJobEvent & {
    type: UpdateType.Queue;
  };
export type StartJobEvent = CommonJobEvent &
  InitialJobEvent & {
    type: UpdateType.Start;
  };
export type ProgressJobEvent = CommonJobEvent & {
  type: UpdateType.Progress;
  progress: {
    percent: number;
    data?: object;
  };
};
export type CompleteJobEvent = CommonJobEvent & {
  type: UpdateType.Complete;
};
export type CancelJobEvent = CommonJobEvent & {
  type: UpdateType.Cancel;
};
export type ErrorJobEvent = CommonJobEvent & {
  type: UpdateType.Error;
  errors: string[];
};

export type JobEvent =
  | ScheduleJobEvent
  | QueueJobEvent
  | StartJobEvent
  | ProgressJobEvent
  | CompleteJobEvent
  | CancelJobEvent
  | ErrorJobEvent;
