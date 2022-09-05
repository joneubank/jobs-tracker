import config from '../../config';
import { Kafka, KafkaConfig } from 'kafkajs';
import createTopic from './createTopic';
import jobUpdatesConsumer from './consumers/jobUpdatesConsumer';

import Logger from 'logger';
import { ServiceStatus } from '../types';
const logger = Logger('Kafka');

let connectionStatus = ServiceStatus.Unknown;

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
  connectionStatus = ServiceStatus.Connected;
  logger.info('Connected.');
};

export const disconnect = async () => {
  logger.warn('Disconnecting all from Kafka...');
  await Promise.all(consumers.map(async (consumer) => await consumer.disconnect()));
  connectionStatus = ServiceStatus.Disconnected;
  logger.warn('Disconnected');
};
