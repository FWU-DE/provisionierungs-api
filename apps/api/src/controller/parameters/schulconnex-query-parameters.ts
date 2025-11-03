export const schulconnexQueryParameterCompleteOptions = [
  'personen',
  'personenkontexte',
  'organisationen',
  'gruppen',
  'beziehungen',
] as const;
export type SchulconnexQueryParameterComplete =
  (typeof schulconnexQueryParameterCompleteOptions)[number];

export class SchulconnexQueryParameters {
  vollstaendig: Set<SchulconnexQueryParameterComplete>;
  pid?: string;
  'personenkontext.id'?: string;
  'gruppe.id'?: string;
  'organisation.id'?: string;

  constructor(
    vollstaendig: undefined | string = undefined,
    pid: undefined | string = undefined,
    personenkontextId: undefined | string = undefined,
    gruppeId: undefined | string = undefined,
    organisationId: undefined | string = undefined,
  ) {
    this.pid = pid;
    this['personenkontext.id'] = personenkontextId;
    this['gruppe.id'] = gruppeId;
    this['organisation.id'] = organisationId;

    this.vollstaendig = new Set<SchulconnexQueryParameterComplete>();
    if (vollstaendig) {
      const values = vollstaendig.split(',');
      const validValues = values.filter((value) =>
        (
          schulconnexQueryParameterCompleteOptions as readonly string[]
        ).includes(value),
      ) as SchulconnexQueryParameterComplete[];
      validValues.forEach((value) => this.vollstaendig.add(value));
    }
  }

  public clone(): SchulconnexQueryParameters {
    return new SchulconnexQueryParameters(
      Array.from(this.vollstaendig).join(','),
      this.pid,
      this['personenkontext.id'],
      this['gruppe.id'],
      this['organisation.id'],
    );
  }

  public toUrlSearchParams(): string {
    const parameters: Record<string, string> = {};
    if (this.vollstaendig.size > 0) {
      parameters.vollstaendig = Array.from(this.vollstaendig).join(',');
    }
    if (this.pid) {
      parameters.pid = this.pid;
    }
    if (this['personenkontext.id']) {
      parameters['personenkontext.id'] = this['personenkontext.id'];
    }
    if (this['gruppe.id']) {
      parameters['gruppe.id'] = this['gruppe.id'];
    }
    if (this['organisation.id']) {
      parameters['organisation.id'] = this['organisation.id'];
    }

    return new URLSearchParams(parameters).toString();
  }
}
