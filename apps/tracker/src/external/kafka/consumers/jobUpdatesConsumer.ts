import { KafkaMessage } from 'kafkajs';
import config from '../../../config';
import createConsumer from '../createConsumer';
import Logger, { unknownToString } from 'logger';
import parseJobUpdateEvent from './eventParsers/parseJobUpdateEvent';
// import { updateJob } from '../../../services/oldIndexService';
import { isObjectLike } from 'lodash';
import { handleUpdateEvent } from '../../../services/eventService';
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

  if (jobEvent.ok) {
    try {
      await handleUpdateEvent(jobEvent.value);
    } catch (error: unknown) {
      logger.error('Error updating job from message', error);
      const errorMessage = unknownToString(error);
      sendDlqMessage(JSON.stringify({ error: errorMessage }));
    }
  } else {
    logger.error('Failure parsing kafka message:', jobEvent.error);
    sendDlqMessage(JSON.stringify({ error: 'Cannot convert message to JobEvent', data: message }));
  }
}

export default consumer;
