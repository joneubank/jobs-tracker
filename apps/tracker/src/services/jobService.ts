import { ResponseError } from '@elastic/elasticsearch/lib/errors';
import { clamp, cloneDeep, get, isArray } from 'lodash';
import config from '../config';
import * as elasticsearch from '../external/elasticsearch';
import Logger from 'logger';
import {
  CancelJobEvent,
  CompleteJobEvent,
  ErrorJobEvent,
  JobEvent,
  ProgressJobEvent,
  QueueJobEvent,
  ScheduleJobEvent,
  StartJobEvent,
  UpdateType,
} from 'data-model/dist/event/types';
import { Job, JobDefinition, JobStatus } from 'data-model/dist/job/types';
import { isJob } from 'data-model/dist/job/validators';
import { convertToDate } from 'data-model/dist/parseUtils';
const logger = Logger('JobService');
/**
 * Job States:
 * - Scheduled
 * - Queued
 * - Running
 * - Completed
 * - Canceled
 * - Paused
 * - Error
 *
 * Update Events:
 * - SCHEDULE
 *   - scheduleDate
 * - QUEUE
 *   - expectedQueueTime (replace with heartbeat timers)
 *   - queuePosition
 * - START
 *   - expectedRunTime (replace with heartbeat timers)
 * - PROGRESS
 * etc.
 *
 * Services:
 * export:
 * - updateJob
 * - getJob
 * - markJobAbandoned
 * private:
 * - fetchJob
 * - indexJob
 * - indexJobUpdate
 *  */
// TODO: Response type with error states: jobAlreadyExists, esIndexError
export async function updateJob(event: JobEvent): Promise<void> {
  logger.debug(`Processing Job Event:`, event);

  const jobId = getJobId(event);

  try {
    const existingJob = await fetchJob(event);

    if (!existingJob) {
      if (UpdateType.Schedule === event.type || UpdateType.Queue === event.type || UpdateType.Start === event.type) {
        logger.info(jobId, `Creating and indexing new job`);
        const job = createJob(event);
        await indexJob(job);
      } else {
        logger.error(jobId, event.type, `No existing job in index, cannot apply update`);
      }
    } else {
      // Check if we can apply this update to the job in the current status
      if (ALLOWED_UPDATES_MAP[existingJob.status].includes(event.type)) {
        switch (event.type) {
          case UpdateType.Schedule:
            await updateJobSchedule(event, existingJob);
            break;
          case UpdateType.Queue:
            await updateJobQueue(event, existingJob);
            break;
          case UpdateType.Start:
            await updateJobStart(event, existingJob);
            break;
          case UpdateType.Progress:
            await updateJobProgress(event, existingJob);
            break;
          case UpdateType.Complete:
            await updateJobComplete(event, existingJob);
            break;
          case UpdateType.Cancel:
            await updateJobCancel(event, existingJob);
            break;
          case UpdateType.Error:
            await updateJobError(event, existingJob);
            break;
        }
        await updateJobAppendEvent(event, existingJob);
      } else {
        logger.warn(
          jobId,
          `Cannot apply this update of type ${event.type} to a job in the state ${existingJob.status}`,
        );
      }
    }
  } catch (e: unknown) {
    // TODO: Reply
    logger.info(jobId, `Failure processing job update`, event, e as object);
    logger.error(jobId, e);
  }
}

async function indexJob(job: Job): Promise<Job | undefined> {
  const es = await elasticsearch.getClient();
  const jobId = getJobId(job);

  try {
    await es.index({
      index: config.elasticsearch.indexName,
      id: jobId,
      body: job,
    });

    return job;
  } catch (e: unknown) {
    logger.error(`Error creating job`, jobId, e);
    return undefined;
  }
}

export async function fetchJob(job: JobDefinition): Promise<Job | undefined> {
  const es = await elasticsearch.getClient();
  const jobId = getJobId(job);
  try {
    const jobResponse = await es.get({
      index: config.elasticsearch.indexName,
      id: jobId,
    });
    const maybeJob = parseEsResponse(jobResponse);
    return maybeJob;
  } catch (e: unknown) {
    if (e instanceof ResponseError) {
      logger.debug(`No job found with ID: ${jobId}`);
      return undefined;
    } else {
      logger.error(`Error fetching job from ES`, e);
    }
  }
}

export async function markJobAbandoned(job: JobDefinition): Promise<Job | undefined> {
  const jobId = getJobId(job);
  logger.debug(`Marking Job as Abandoned`, jobId);

  const es = await elasticsearch.getClient();

  try {
    const existingJob = await fetchJob(job);

    if (!existingJob) {
      logger.error(`Cannot mark job as abandoned, it does not exist`);
      return undefined;
    }

    es.update({ index: config.elasticsearch.indexName, id: jobId, body: { abandoned: true } });
  } catch (e: unknown) {}
}

export function getJobId(job: JobDefinition): string {
  const separator = '_';

  const tokens = [job.service, job.name, job.id];
  const cleaned = tokens.map((token) => token.replaceAll(separator, ''));

  return cleaned.join(separator);
}

export function parseEsResponse(response: any): Job | undefined {
  logger.debug(`es response`, response);

  if (!response) {
    return undefined;
  }

  const rawJobData = get(response, 'body._source');

  const dateProps = ['createdAt', 'startedAt', 'cancelledAt', 'completedAt', 'errorAt', 'scheduledStartTime'];
  const jobData = cloneDeep(rawJobData);
  dateProps.forEach((prop) => {
    if (rawJobData[prop]) {
      jobData[prop] = convertToDate(rawJobData[prop]);
    }
  });
  // Convert dates in jobUpdates
  if (isArray(jobData.updates)) {
    const updateDateProps = ['eventTime', 'scheduledStartTime'];
    (jobData.updates as any[]).forEach((updateEvent) => {
      updateDateProps.forEach((prop) => {
        if (updateEvent[prop]) {
          updateEvent[prop] = convertToDate(updateEvent[prop]);
        }
      });
    });
  }

  if (isJob(jobData)) {
    return jobData;
  }
  return undefined;
}

function createJob(createEvent: ScheduleJobEvent | QueueJobEvent | StartJobEvent): Job {
  const { service, name, id, node, inputs } = createEvent;
  const status =
    createEvent.type === UpdateType.Schedule
      ? JobStatus.Scheduled
      : createEvent.type === UpdateType.Queue
      ? JobStatus.Queued
      : JobStatus.Running;
  const output: Job = {
    service,
    name,
    id,
    node,
    inputs: inputs || {},
    status,
    createdAt: new Date(),
    abandoned: false,
    progress: {
      percent: 0,
      data: {},
    },
    updates: [createEvent],
    errors: [],
  };
  switch (createEvent.type) {
    case UpdateType.Schedule:
      createEvent.scheduledStartTime;
      break;
    case UpdateType.Queue:
      break;
    case UpdateType.Start:
      output.startedAt = new Date();
      break;
  }
  return output;
}

// TODO: For all of these, make sure to set abandoned=false
async function updateJobSchedule(scheduleEvent: ScheduleJobEvent, job: Job): Promise<void> {
  const jobId = getJobId(job);
  const es = await elasticsearch.getClient();

  const updates: Partial<Job> = { status: JobStatus.Scheduled };

  await es.update({
    index: config.elasticsearch.indexName,
    id: jobId,
    body: { doc: updates },
  });
}

async function updateJobQueue(queueEvent: QueueJobEvent, job: Job): Promise<void> {
  const jobId = getJobId(job);
  const es = await elasticsearch.getClient();

  const updates: Partial<Job> = { status: JobStatus.Queued };

  await es.update({
    index: config.elasticsearch.indexName,
    id: jobId,
    body: { doc: updates },
  });
}

async function updateJobStart(startEvent: StartJobEvent, job: Job): Promise<void> {
  const jobId = getJobId(job);
  const es = await elasticsearch.getClient();

  const updates: Partial<Job> = { status: JobStatus.Running, startedAt: new Date() };

  await es.update({
    index: config.elasticsearch.indexName,
    id: jobId,
    body: { doc: updates },
  });
}

async function updateJobProgress(progressEvent: ProgressJobEvent, job: Job): Promise<void> {
  const jobId = getJobId(job);
  const es = await elasticsearch.getClient();

  // Keep progress numbers between 0 and 100
  const progress = { ...job.progress, ...progressEvent.progress };
  progress.percent = clamp(progressEvent.progress.percent, 0, 100);

  logger.debug(jobId, `Updating Job for Progress Event`, progress);

  // Update job progress
  await es.update({
    index: config.elasticsearch.indexName,
    id: jobId,
    body: { doc: { progress } },
  });
}

async function updateJobComplete(completeEvent: CompleteJobEvent, job: Job): Promise<void> {
  const jobId = getJobId(job);
  const es = await elasticsearch.getClient();

  const updates: Partial<Job> = { status: JobStatus.Completed, completedAt: new Date() };

  await es.update({
    index: config.elasticsearch.indexName,
    id: jobId,
    body: { doc: updates },
  });
}

async function updateJobCancel(cancelEvent: CancelJobEvent, job: Job): Promise<void> {
  const jobId = getJobId(job);
  const es = await elasticsearch.getClient();

  const updates: Partial<Job> = { status: JobStatus.Canceled, cancelledAt: new Date() };

  await es.update({
    index: config.elasticsearch.indexName,
    id: jobId,
    body: { doc: updates },
  });
}

async function updateJobError(errorEvent: ErrorJobEvent, job: Job): Promise<void> {
  const jobId = getJobId(job);
  const es = await elasticsearch.getClient();

  const updates: Partial<Job> = { status: JobStatus.Error, errorAt: new Date() };
  const errors = errorEvent.errors;

  await es.update({
    index: config.elasticsearch.indexName,
    id: jobId,
    body: { doc: updates },
  });
  await es.update({
    index: config.elasticsearch.indexName,
    id: jobId,
    body: {
      script: { source: `ctx._source.errors.add(params.errors)`, lang: 'painless', params: { errors } },
    },
  });
}

async function updateJobAppendEvent(event: JobEvent, job: Job): Promise<void> {
  const jobId = getJobId(job);
  const es = await elasticsearch.getClient();
  await es.update({
    index: config.elasticsearch.indexName,
    id: jobId,
    body: {
      script: { source: `ctx._source.updates.add(params.event)`, lang: 'painless', params: { event } },
    },
  });
}
/**
 * Managing state transitions
 */

const ALLOWED_UPDATES_MAP: Record<JobStatus, UpdateType[]> = {
  [JobStatus.Scheduled]: [UpdateType.Schedule, UpdateType.Queue, UpdateType.Start, UpdateType.Cancel, UpdateType.Error],
  [JobStatus.Queued]: [UpdateType.Queue, UpdateType.Start, UpdateType.Cancel, UpdateType.Error],
  [JobStatus.Running]: [UpdateType.Progress, UpdateType.Complete, UpdateType.Cancel, UpdateType.Error],
  // Completed, Canceled, and Error are end states that accept no updates
  [JobStatus.Completed]: [],
  [JobStatus.Canceled]: [UpdateType.Error],
  [JobStatus.Error]: [UpdateType.Error],
};
