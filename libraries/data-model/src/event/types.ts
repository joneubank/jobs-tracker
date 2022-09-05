import { JobDefinition, JobInputs, JobProgress } from '../job/types';

export enum EventType {
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
  type: EventType;
  node?: string;
};

// Common properties for defining a new job (schedule, queue, start)
export type InitialJobEvent = {
  inputs?: JobInputs;
};

export type ScheduleJobEvent = CommonJobEvent &
  InitialJobEvent & {
    type: EventType.Schedule;
    scheduledStartTime: Date;
  };
export type QueueJobEvent = CommonJobEvent &
  InitialJobEvent & {
    type: EventType.Queue;
  };
export type StartJobEvent = CommonJobEvent &
  InitialJobEvent & {
    type: EventType.Start;
  };
export type ProgressJobEvent = CommonJobEvent & {
  type: EventType.Progress;
  progress: JobProgress;
};
export type CompleteJobEvent = CommonJobEvent & {
  type: EventType.Complete;
};
export type CancelJobEvent = CommonJobEvent & {
  type: EventType.Cancel;
};
export type ErrorJobEvent = CommonJobEvent & {
  type: EventType.Error;
  error: string;
};

export type JobEvent =
  | ScheduleJobEvent
  | QueueJobEvent
  | StartJobEvent
  | ProgressJobEvent
  | CompleteJobEvent
  | CancelJobEvent
  | ErrorJobEvent;
