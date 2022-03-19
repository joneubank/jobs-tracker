import { cloneDeep } from 'lodash';
import Logger from '../../../../logger';
import { isJobEvent } from '../../../../model/events/validators';
import { JobEvent } from '../../../../model/events/types';
import { convertToDate } from '../../../../model/parseUtils';
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
