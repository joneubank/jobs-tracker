import { Job, JobEvent, JobProgress, JobStatus, EventType } from 'data-model';

import mongoose, { Schema } from 'mongoose';
import Logger from 'logger';
const logger = Logger('Mongo.JobModel');

const JobProgressSchema = new mongoose.Schema<JobProgress>(
  {
    percent: { type: Number, min: 0, max: 100, required: true },
    data: { type: Schema.Types.Mixed },
  },
  {
    _id: false,
  },
);

const JobUpdateSchema = new mongoose.Schema<JobEvent>(
  {
    eventTime: { type: Date, required: true },
    type: { type: String, required: true, enum: Object.values(EventType) },
    node: { type: String },

    inputs: { type: Schema.Types.Mixed },

    scheduledStartTime: { type: Date },

    progress: { type: JobProgressSchema },

    error: { type: String },
  },
  {
    _id: false,
  },
);

const JobSchema = new mongoose.Schema<Job>(
  {
    service: { type: String, required: true, index: true },
    name: { type: String, required: true, index: true },
    id: { type: String, required: true, index: true },
    node: { type: String, index: true },

    status: { type: String, required: true, enum: Object.values(JobStatus) },

    inputs: { type: Schema.Types.Mixed },

    startedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    errorAt: { type: Date },

    scheduledStartTime: { type: Date },

    progress: { type: JobProgressSchema, required: true },
    events: { type: [JobUpdateSchema], required: true },
    error: { type: String },
  },
  { timestamps: true, supressReservedKeysWarning: true },
);

const JobModel = mongoose.model<Job>('Job', JobSchema);

export default JobModel;

// export function
// export function mongoToPojo(doc: JobMongooseDocument): Job {
//   return {
//     status: JobStatus[doc.status],
//     node: doc.node,

//     inputs: doc.inputs,

//     createdAt: doc.createdAt,
//     updatedAt: doc.updatedAt,

//     startedAt: doc.startedAt,
//     completedAt: doc.completedAt,
//     cancelledAt: doc.cancelledAt,
//     errorAt: doc.errorAt,

//     scheduledStartTime: doc.scheduledStartTime,

//     progress: doc.progress,
//     updates: doc.updates.map()
//     errors: doc.errors,

//     abandoned: doc.abandoned,
//   }
// }
