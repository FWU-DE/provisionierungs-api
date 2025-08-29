export function ensureError(value: unknown): Error {
  if (value instanceof Error) return value;

  let stringified = '[Unable to stringify the thrown value]';
  try {
    stringified = JSON.stringify(value);
  } catch {
    /* empty */
  }

  const error = new Error(
    `This value was thrown as is, not through an Error: type="${typeof value}" (${stringified})`,
  );
  return error;
}
