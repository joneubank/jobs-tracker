import { Document, Types } from 'mongoose';

import JobModel from '../external/mongo/jobModel';
import { JobEvent, Job, JobDefinition } from 'data-model';
import Logger from 'logger';
import _ from 'lodash';
import { Maybe, maybe } from 'optionals';
const logger = Logger('Service.DB');

export type MongoJob = Document<unknown, any, Job> &
  Job & {
    _id: Types.ObjectId;
  };

export async function getJob(definition: JobDefinition): Promise<Maybe<MongoJob>> {
  // break this down so if someone passes a whole job (instead of just defintiion) we only find based on the definition, not all properties of the job.
  const { id, service, name } = definition;
  const doc = await JobModel.findOne({ id, service, name });
  return maybe(doc);
}

// enum CreateJobResult {
//   Success,
//   Error,
// }
// type CreateJobSuccess = {
//   result: CreateJobResult.Success;
//   job: Job;
// };
// type CreateJobError = {
//   result: CreateJobResult.Error;
//   message: string;
// };
// type CreateJobResponse = CreateJobSuccess | CreateJobError;
export async function createJob(job: Job): Promise<MongoJob> {
  return await JobModel.create(job);
}

export async function updateJob(events: JobEvent[], updates: Partial<Omit<Job, 'updates'>>) {}

export function mongoJobToPojo(mongoJob: MongoJob): Job {
  return {
    service: mongoJob.service,
    name: mongoJob.name,
    id: mongoJob.id,
    status: mongoJob.status,
    node: mongoJob.node,
    inputs: mongoJob.inputs,
    createdAt: mongoJob.createdAt,
    updatedAt: mongoJob.updatedAt,
    startedAt: mongoJob.startedAt,
    completedAt: mongoJob.completedAt,
    cancelledAt: mongoJob.cancelledAt,
    errorAt: mongoJob.errorAt,
    scheduledStartTime: mongoJob.scheduledStartTime,
    progress: mongoJob.progress,
    events: mongoJob.events,
    error: mongoJob.error,
  };
}
