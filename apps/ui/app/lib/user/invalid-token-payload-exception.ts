export class InvalidTokenPayloadException extends Error {
  constructor() {
    super('Failed to extract school or organization information from access token payload');
    this.name = 'InvalidTokenPayloadException';
  }
}
