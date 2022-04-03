import { JobEvent } from 'data-model/dist/event/types';
import { isJobEvent } from 'data-model/dist/event/validators';
import { convertToDate } from 'data-model/dist/parseUtils';
import { cloneDeep } from 'lodash';
import Logger from 'logger';
const logger = Logger('Kafka.Consumers.parseJobUpdateEvent');

/**
 * Provided a message from kafka, convert the data into a TypeScript checked JobEvent object
 * @param message
 * @returns returns undefined if the data can't be converted correctly
 */
function parseJobUpdateEvent(message: any): JobEvent | undefined {
  const dateProps = ['eventTime', 'scheduledStartTime'];
  const output = cloneDeep(message);
  dateProps.forEach((prop) => {
    if (message[prop]) {
      output[prop] = convertToDate(message[prop]);
    }
  });
  if (isJobEvent(output)) {
    return output;
  }
  return undefined;
}

export default parseJobUpdateEvent;
