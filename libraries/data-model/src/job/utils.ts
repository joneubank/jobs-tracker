import { JobDefinition } from './types';

export function getJobId(definition: JobDefinition): string {
  const separator = '_';

  const tokens = [definition.service, definition.name, definition.id];
  const cleaned = tokens.map((token) => token.replaceAll(separator, ''));

  return cleaned.join(separator);
}
