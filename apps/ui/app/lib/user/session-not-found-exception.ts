export class SessionNotFoundException extends Error {
  constructor() {
    super('Failed to get a valid session');
    this.name = 'SessionNotFoundException';
  }
}
