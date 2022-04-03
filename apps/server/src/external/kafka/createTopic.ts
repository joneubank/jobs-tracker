import { KafkaTopicConfiguration } from '../../config';
import { Kafka } from 'kafkajs';
import Logger from 'logger';
const logger = Logger('Kafka.createTopic');

const createTopic = async (kafka: Kafka, config: KafkaTopicConfiguration) => {
  const topic = config.topic;
  const numPartitions = config.partitions;
  logger.info(`Creating topic "${topic}" with ${numPartitions} partitions`);
  const kafkaAdmin = kafka.admin();
  try {
    await kafkaAdmin.connect();
    const isTopicCreated = await kafkaAdmin.createTopics({
      topics: [
        {
          topic,
          numPartitions,
        },
      ],
    });
    await kafkaAdmin.disconnect();
    if (isTopicCreated) {
      logger.info(`Topic "${topic}" has been created`);
    } else {
      logger.info(`Topic "${topic}" already exists`);
    }
  } catch (err) {
    logger.error(`Error occured when creating topic "${topic}"`);
    throw err;
  }
};

export default createTopic;
