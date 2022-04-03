import { Kafka, KafkaConfig, Producer, ICustomPartitioner } from 'kafkajs';
import { JobEvent } from 'data-model/dist/event/types';

import Logger from 'logger';
const logger = Logger('JobTrackerClient.Kafka');

let jobEventProducer: Producer;

export async function setup(
  kafkaConfig: KafkaConfig = {
    clientId: 'job-tracker-client',
    brokers: ['localhost:9092'],
  },
): Promise<void> {
  const kafka = new Kafka(kafkaConfig);

  logger.info('Initializing Kafka connection...');
  jobEventProducer = kafka.producer({
    allowAutoTopicCreation: false,
  });
  logger.info('Connected to Kafka.');
}

export async function produceJobEvent(event: JobEvent) {
  if (!jobEventProducer) {
    await setup();
  }
}
