import {
  isString,
  isDate,
  isObject,
  has,
  isNumber,
  isObjectLike,
  isBoolean,
  isArray,
} from "lodash";
import { isJobEvent } from "../event/validators";
import { Job, JobDefinition, JobProgress, JobStatus } from "./types";
import Logger from "logger";
const logger = Logger("Model.Jobs.Validators");

export function isJobDefinition(input: any): input is JobDefinition {
  return (
    isObjectLike(input) &&
    isString(input.service) &&
    isString(input.name) &&
    isString(input.id)
  );
}

export function isJobProgress(input: any): input is JobProgress {
  return isObjectLike(input) && isNumber(input.percent);
}

export function isJob(input: any): input is Job {
  const hasDefinition = isJobDefinition(input);
  const hasJobProps =
    isString(input.status) &&
    Object.values(JobStatus).includes(input.status) &&
    (!has(input, "node") || isString(input.node)) &&
    (!has(input, "inputs") || isObject(input.inputs)) &&
    isDate(input.createdAt) &&
    isOptionalDate(input, "startedAt") &&
    isOptionalDate(input, "cancelledAt") &&
    isOptionalDate(input, "completedAt") &&
    isOptionalDate(input, "errorAt") &&
    isOptionalDate(input, "scheduledStartTime") &&
    isJobProgress(input.progress) &&
    isBoolean(input.abandoned);

  const hasUpdates =
    isArray(input.updates) &&
    (input.updates as any[]).reduce((acc, val) => acc && isJobEvent(val), true);

  const hasErrors =
    isArray(input.errors) &&
    (input.errors as any[]).reduce((acc, val) => acc && isString(val), true);

  logger.debug({ hasDefinition, hasJobProps, hasUpdates, hasErrors });

  return hasDefinition && hasJobProps && hasUpdates && hasErrors;
}

function isOptionalDate(input: any, property: string): boolean {
  return !has(input, property) || isDate(input[property]);
}
