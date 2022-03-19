import config from '../../config';
import { Kafka, KafkaConfig } from 'kafkajs';
import createTopic from './createTopic';
import jobUpdatesConsumer from './consumers/jobUpdatesConsumer';

import Logger from '../../logger';
const logger = Logger('Kafka');

const consumers = [jobUpdatesConsumer];

export const setup = async (
  kafkaConfig: KafkaConfig = {
    clientId: 'donor-submission-aggregator',
    brokers: [config.kafka.broker],
  },
): Promise<void> => {
  const kafka = new Kafka(kafkaConfig);

  logger.info('Initializing Kafka connections...');
  await Promise.all([
    createTopic(kafka, config.kafka.topics.jobUpdates),
    ...consumers.map((consumer) => consumer.init(kafka)),
  ]);
  logger.info('Connected.');
};

export const disconnect = async () => {
  logger.warn('Disconnecting all from Kafka...');
  await Promise.all(consumers.map(async (consumer) => await consumer.disconnect()));
  logger.warn('Disconnected');
};
