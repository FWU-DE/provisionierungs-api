export class ActionsEntry {
  [key: string]: string;

  constructor(data: Record<string, string> = {}) {
    Object.assign(this, data);
  }
}
