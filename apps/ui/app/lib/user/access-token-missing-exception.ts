export class AccessTokenMissingException extends Error {
  constructor() {
    super('Failed to extract access token from session');
    this.name = 'AccessTokenMissingException';
  }
}
