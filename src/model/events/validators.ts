import { isDate, isString, isObjectLike, isNumber, isArray } from 'lodash';
import { JobDefinition } from '../jobs/types';
import { CommonJobEvent, InitialJobEvent, JobEvent, UpdateType } from './types';

import Logger from '../../logger';
const logger = Logger('Events.Validators');

function isCommonJobEvent(input: any): input is CommonJobEvent {
  return (
    isObjectLike(input) &&
    isDate(input.eventTime) &&
    isString(input.type) &&
    Object.values(UpdateType).includes(input.type)
  );
}
function isInitialJobEvent(input: any): input is InitialJobEvent {
  if (isObjectLike(input)) {
    if (input.inputs && !isObjectLike(input.inputs)) {
      return false;
    }
    if (input.node && !isString(input.node)) {
      return false;
    }
    return true;
  }
  return false;
}

/**
 * Methods to test specific event types are only checking the specific fields
 */
function hasScheduleJobEventProperties(input: any): boolean {
  return isDate(input.scheduledStartTime);
}
function hasQueueJobEventProperties(input: any): boolean {
  return false;
}
function hasStartJobEventProperties(input: any): boolean {
  return true;
}
function hasProgressJobEventProperties(input: any): boolean {
  return (
    isObjectLike(input.progress) &&
    isNumber(input.progress.percent) &&
    (!input.progress.data || isObjectLike(input.progress.data))
  );
}
function hasCompleteJobEventProperties(input: any): boolean {
  return false;
}
function hasCancelJobEventProperties(input: any): boolean {
  return false;
}
function hasErrorJobEventProperties(input: any): boolean {
  return isArray(input.errors) && (input.errors as any[]).reduce((acc, val) => acc && isString(val), true);
}

const eventPropertiesValidationMap: Record<UpdateType, (input: any) => boolean> = {
  [UpdateType.Schedule]: hasScheduleJobEventProperties,
  [UpdateType.Queue]: hasQueueJobEventProperties,
  [UpdateType.Start]: hasStartJobEventProperties,
  [UpdateType.Progress]: hasProgressJobEventProperties,
  [UpdateType.Complete]: hasCompleteJobEventProperties,
  [UpdateType.Cancel]: hasCancelJobEventProperties,
  [UpdateType.Error]: hasErrorJobEventProperties,
};

export function isJobEvent(input: any): input is JobEvent {
  if (isCommonJobEvent(input)) {
    return eventPropertiesValidationMap[input.type](input);
  }
  return false;
}
