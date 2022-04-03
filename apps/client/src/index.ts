import { KafkaConfig } from 'kafkajs';
import * as kafka from './external/kafka';
import { TrackedJob, JobOptions } from './types';
export type JobTrackerClientConfig = {
  kafka: KafkaConfig;
  service: string;
  node?: string;
};

export type JobTrackerClient = {
  createJob: (name: string, id?: string, options?: JobOptions) => TrackedJob;
  listJobs: (name?: string) => TrackedJob[];
  getJob: (id: string) => TrackedJob | undefined;
};

async function createJobTrackerClient(config: JobTrackerClientConfig): Promise<JobTrackerClient | {}> {
  await kafka.setup(config.kafka);

  const jobs: Record<string, TrackedJob> = {};

  return {};
}

export default createJobTrackerClient;
