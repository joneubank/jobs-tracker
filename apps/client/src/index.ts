import { randomUUID } from 'crypto';
import { JobInputs, EventType } from 'data-model';
import { KafkaConfig } from 'kafkajs';
import * as kafka from './external/kafka';
import { TrackedJob } from './TrackedJob';

export { TrackedJob } from './TrackedJob';

export type JobsTrackerClientConfig = {
  kafka: { config: KafkaConfig; topic: string };
  service: string;
  node?: string;
};

async function createClient(config: JobsTrackerClientConfig) {
  const kafkaClient = await kafka.getKafkaClient(config.kafka.topic, config.kafka.config);

  const createJob = (jobName: string, options: { id?: string; inputs?: JobInputs } = {}): TrackedJob => {
    return new TrackedJob(
      kafkaClient,
      { id: options.id || randomUUID(), name: jobName, service: config.service },
      { node: config.node, inputs: options.inputs },
    );
  };

  return { createJob };
}

export default createClient;
