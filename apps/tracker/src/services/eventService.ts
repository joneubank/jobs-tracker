import {
  Job,
  JobStatus,
  JobEvent,
  QueueJobEvent,
  ScheduleJobEvent,
  StartJobEvent,
  EventType,
  allowedUpdate,
  getJobId,
  getStatusForEvent,
} from 'data-model';
import * as dbService from './dbService';

import { indexJob } from './indexService';

import Logger from 'logger';
import { failure, Result, success } from 'optionals';
const logger = Logger('Service.Events');

export async function handleUpdateEvent(event: JobEvent): Promise<Result<Job, string>> {
  // check if job is in DB
  const jobId = getJobId(event);
  logger.debug(jobId, `Handling update event for job`);
  const maybeJob = await dbService.getJob(event);

  // if in DB, apply update if appropriate
  if (maybeJob.ok) {
    logger.debug(jobId, `Existing job found`);
    const existingJob = maybeJob.value;
    const response = await updateExistingJob(event, existingJob);
    indexIfOk(response);
    return response;
  } else {
    // if not in DB, create if appropriate
    logger.debug(jobId, `No existing job found`);
    const response = await createNewJob(event);
    indexIfOk(response);
    return response;
  }
}

function indexIfOk(updateResponse: Result<Job, any>) {
  if (updateResponse.ok) {
    indexJob(updateResponse.value);
  }
}

async function updateExistingJob(event: JobEvent, existingJob: dbService.MongoJob): Promise<Result<Job, string>> {
  if (allowedUpdate(existingJob, event)) {
    // allowed update
    existingJob.events.push(event);
    existingJob.status = getStatusForEvent(event);
    switch (event.type) {
      case EventType.Schedule:
        existingJob.scheduledStartTime = event.scheduledStartTime;
        break;
      case EventType.Queue:
        break;
      case EventType.Start:
        existingJob.startedAt = event.eventTime;
        break;
      case EventType.Progress:
        existingJob.progress = event.progress;
        break;
      case EventType.Complete:
        existingJob.progress.percent = 100;
        existingJob.completedAt = event.eventTime;
        break;
      case EventType.Cancel:
        existingJob.cancelledAt = event.eventTime;
        break;
      case EventType.Error:
        existingJob.errorAt = event.eventTime;
        existingJob.error = event.error;
        break;
    }

    try {
      await existingJob.save();
      return success(dbService.mongoJobToPojo(existingJob));
    } catch (err) {
      logger.warn(`Failure updating job in database! ${err}`);
      return failure(`Failure updating job in database: ${err}`);
    }
  } else {
    const errMessage = `Event of type ${event.type} cannot be applied to job in status ${existingJob.status}`;
    logger.warn(errMessage);
    return failure(errMessage);
  }
}

async function createNewJob(event: JobEvent): Promise<Result<Job, string>> {
  const jobId = getJobId(event);
  if (EventType.Schedule === event.type || EventType.Queue === event.type || EventType.Start === event.type) {
    const newJob = createJobForEvent(event);

    try {
      const job = await dbService.createJob(newJob);
      if (job) {
        return success(dbService.mongoJobToPojo(job));
      } else {
        const errMessage = `${jobId} - Failed to create new job for event ${JSON.stringify(event)}`;
        logger.error(errMessage);
        return failure(errMessage);
      }
    } catch (err) {
      const errMessage = `${jobId} - Failure creating job in database! ${err}`;
      logger.error(errMessage);
      return failure(errMessage);
    }
  } else {
    // Cannot create job from this event type
    const errMessage = `${jobId} - Cannot create new job for event with type ${event.type}`;
    logger.warn(errMessage);
    return failure(errMessage);
  }
}

function createJobForEvent(event: ScheduleJobEvent | QueueJobEvent | StartJobEvent): Job {
  const { service, name, id, node, inputs } = event;
  const status =
    event.type === EventType.Schedule
      ? JobStatus.Scheduled
      : event.type === EventType.Queue
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
    updatedAt: new Date(),
    progress: {
      percent: 0,
      data: {},
    },
    events: [event],
  };

  // update with specific properties for the event type
  switch (event.type) {
    case EventType.Schedule:
      event.scheduledStartTime;
      break;
    case EventType.Queue:
      break;
    case EventType.Start:
      output.startedAt = new Date();
      break;
  }
  return output;
}
