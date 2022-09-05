import { JobEvent, EventType } from './event/types';
import { Job, JobStatus } from './job/types';

const MAP_ALLOWED_EVENT_TYPE_FOR_JOB: Record<JobStatus, EventType[]> = {
  [JobStatus.Scheduled]: [EventType.Schedule, EventType.Queue, EventType.Start, EventType.Cancel, EventType.Error],
  [JobStatus.Queued]: [EventType.Queue, EventType.Start, EventType.Cancel, EventType.Error],
  [JobStatus.Running]: [EventType.Progress, EventType.Complete, EventType.Cancel, EventType.Error],
  // Completed, Canceled, and Error are end states that accept no updates
  [JobStatus.Completed]: [],
  [JobStatus.Canceled]: [EventType.Error],
  [JobStatus.Error]: [EventType.Error],
  [JobStatus.Abandoned]: [EventType.Progress, EventType.Complete, EventType.Cancel, EventType.Error],
};
export function allowedUpdate(job: Job, event: JobEvent): boolean {
  return MAP_ALLOWED_EVENT_TYPE_FOR_JOB[job.status].includes(event.type);
}

const MAP_EVENT_TYPE_TO_JOB_STATUS: Record<EventType, JobStatus> = {
  [EventType.Schedule]: JobStatus.Scheduled,
  [EventType.Queue]: JobStatus.Queued,
  [EventType.Start]: JobStatus.Running,
  [EventType.Progress]: JobStatus.Running,
  [EventType.Complete]: JobStatus.Completed,
  [EventType.Cancel]: JobStatus.Canceled,
  [EventType.Error]: JobStatus.Error,
};
export function getStatusForEvent(event: JobEvent): JobStatus {
  return MAP_EVENT_TYPE_TO_JOB_STATUS[event.type];
}
