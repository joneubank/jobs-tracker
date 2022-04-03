import { KafkaMessage } from 'kafkajs';
import config from '../../../config';
import createConsumer from '../createConsumer';
import Logger from 'logger';
import parseJobUpdateEvent from './eventParsers/parseJobUpdateEvent';
import { updateJob } from '../../../services/jobService';
import { isObjectLike } from 'lodash';
const logger = Logger('Kafka.Consumer.JobUpdates');

/**
 * Clinical Update Event Consumer
 * Whenever clinical service notifies that new clinical data has been submitted for a program, we queue a FILE_RELEASE event in the programQueue
 */
const consumer = createConsumer(config.kafka.consumers.jobUpdates, handleEvent);

async function handleEvent(message: KafkaMessage, sendDlqMessage: (messageJSON: string) => Promise<void>) {
  const stringMessage = message.value?.toString() || '';
  logger.debug(`Received message: `, stringMessage);

  const jobEvent = parseJobUpdateEvent(stringMessage);

  if (!jobEvent) {
    logger.error(`Message cannot be converted to Job Update Event`);
    sendDlqMessage(JSON.stringify({ error: 'Cannot convert message to JobEvent', data: message }));
    return;
  }

  try {
    await updateJob(jobEvent);
  } catch (error: unknown) {
    logger.error('Error updating job from message', error);
    if (isObjectLike(error)) {
      sendDlqMessage(JSON.stringify({ error, data: message }));
    } else {
      sendDlqMessage(JSON.stringify({ error: 'Unknown Error', data: message }));
    }
  }
}

export default consumer;
