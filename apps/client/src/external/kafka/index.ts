import { Kafka, KafkaConfig, Producer } from 'kafkajs';

import { getJobId, JobEvent } from 'data-model';

import { JobTrackerExternalClient } from '../';

import Logger from 'logger';
const logger = Logger('JobsTrackerClient.Kafka');

export async function getKafkaClient(
  topic: string,
  kafkaConfig: KafkaConfig = {
    clientId: 'job-tracker-client',
    brokers: ['localhost:9092'],
  },
): Promise<JobTrackerExternalClient> {
  const kafka = new Kafka(kafkaConfig);
  let jobEventProducer: Producer;

  logger.info('Initializing Kafka connection...');
  jobEventProducer = kafka.producer({
    allowAutoTopicCreation: false,
  });
  await jobEventProducer.connect();
  logger.info('Connected to Kafka.');

  const sendJobEvent = async (event: JobEvent): Promise<void> => {
    try {
      await jobEventProducer.send({ topic, messages: [{ value: JSON.stringify(event) }] });
      logger.debug(`Sent kafka message for job event`, getJobId(event), event.type);
    } catch (err) {
      logger.error(`Failure sending kafka message for job event`, getJobId(event), event.type, err);
    }
  };

  return { sendJobEvent };
}
