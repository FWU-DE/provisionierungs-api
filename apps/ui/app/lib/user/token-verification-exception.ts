export class TokenVerificationException extends Error {
  constructor(cause?: unknown) {
    super('Failed to verify session access token payload');
    this.name = 'TokenVerificationException';
    this.cause = cause;
  }
}
