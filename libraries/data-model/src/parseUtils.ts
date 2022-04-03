import { isDate } from "lodash";
import Logger from "logger";
const logger = Logger("Model.ParseUtils");

export function convertToDate(value: any): Date | undefined {
  try {
    if (isDate(value)) {
      return value;
    } else {
      const isoDate = new Date(value);
      if (isDate(isoDate)) {
        return isoDate;
      } else {
        const epochDate = new Date(Number(value));
        if (isDate(epochDate)) {
          return epochDate;
        }
      }
    }
  } catch (e: unknown) {
    if (e instanceof Error || e instanceof String) {
      logger.warn(`Error parsing date from value`, value, e);
    } else {
      logger.warn(`Unknown error occurred parsing date from value`);
    }
  }
  return undefined;
}
