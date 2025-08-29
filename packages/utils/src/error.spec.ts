import { ensureError } from './error';

/**
 * @group unit
 */
describe('error util', () => {
  it('passes Error object as-is', () => {
    const error = new Error('test');
    expect(ensureError(error)).toBe(error);
  });

  it.each([
    [1, 'type="number" (1)'],
    ['string-value', 'type="string" ("string-value")'],
    [true, 'type="boolean" (true)'],
    [null, 'type="object" (null)'],
    [undefined, 'type="undefined" (undefined)'],
  ])('transforms scalar "%s" into Error object', (scalar, expectMessage) => {
    const error = scalar;
    expect(ensureError(error).message).toBe(
      'This value was thrown as is, not through an Error: ' + expectMessage,
    );
  });

  it('transforms function into Error object', () => {
    expect(ensureError(() => null).message).toBe(
      'This value was thrown as is, not through an Error: type="function" (undefined)',
    );
  });

  it('Cannot serialize', () => {
    // Bigint is not serializable.
    expect(ensureError(10n).message).toBe(
      'This value was thrown as is, not through an Error: type="bigint" ([Unable to stringify the thrown value])',
    );
  });
});
