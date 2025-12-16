/**
 * Schulconnex organization query parameters
 *
 * The schulconnex API allows the usage of query parameters for data filtration.
 * Documentation: https://schulconnex.de/docs/generated/openapi/dienste/read-organisationen-info
 */

export class SchulconnexOrganizationQueryParameters {
  id?: string;
  kennung?: string;
  name?: string;
  typ?: string;

  constructor(
    id: undefined | string = undefined,
    kennung: undefined | string = undefined,
    name: undefined | string = undefined,
    typ: undefined | string = undefined,
  ) {
    this.id = id;
    this.kennung = kennung;
    this.name = name;
    this.typ = typ;
  }

  public clone(): SchulconnexOrganizationQueryParameters {
    return new SchulconnexOrganizationQueryParameters(this.id, this.kennung, this.name, this.typ);
  }

  public toUrlSearchParams(): string {
    const parameters: Record<string, string> = {};
    if (this.id) {
      parameters.pid = this.id;
    }
    if (this.kennung) {
      parameters.kennung = this.kennung;
    }
    if (this.name) {
      parameters.name = this.name;
    }
    if (this.typ) {
      parameters.typ = this.typ;
    }
    return new URLSearchParams(parameters).toString();
  }
}
