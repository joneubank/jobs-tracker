export function unknownToString(input: unknown): string {
  if (input instanceof Error) {
    return input.message;
  } else if (typeof input === 'object') {
    return JSON.stringify(input);
  } else {
    return `${input}`;
  }
}
