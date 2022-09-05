import { JobEvent, convertToDate, isJobEvent } from 'data-model';
import { cloneDeep, isNumber } from 'lodash';
import Logger, { unknownToString } from 'logger';
import { failure, Result, success } from 'optionals';
const logger = Logger('Kafka.Consumers.parseJobUpdateEvent');

/**
 * Provided a message from kafka, convert the data into a TypeScript checked JobEvent object
 * @param message
 * @returns returns undefined if the data can't be converted correctly
 */
function parseJobUpdateEvent(message: string): Result<JobEvent, string> {
  try {
    const output = JSON.parse(message);

    const dateProps = ['eventTime', 'scheduledStartTime'];
    dateProps.forEach((prop) => {
      if (output[prop]) {
        output[prop] = convertToDate(output[prop]);
      }
    });
    if (isJobEvent(output)) {
      return success(output);
    } else {
      return failure('Message is not correct structure for a Job Update Event.');
    }
  } catch (err) {
    return failure(`Could not parse string - ${unknownToString(err)}`);
  }
}

export default parseJobUpdateEvent;
