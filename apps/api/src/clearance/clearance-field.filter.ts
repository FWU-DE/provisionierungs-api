import { SchulconnexPersonsResponse } from '../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { type SchulconnexPersonContext } from '../identity-management/dto/schulconnex/schulconnex-person-context.dto';
import { type SchulconnexClearanceVisibleFields } from './schulconnex-clearance-options.interface';
import { type SchulconnexPerson } from '../identity-management/dto/schulconnex/schulconnex-person.dto';
import { type SchulconnexOrganization } from '../identity-management/dto/schulconnex/schulconnex-organization.dto';
import { type SchulconnexGroupdataset } from '../identity-management/dto/schulconnex/schulconnex-groupdataset.dto';
import { plainToInstance } from 'class-transformer';

export function applyClearancePersonsFieldFilter(
  offerId: number,
  identities: SchulconnexPersonsResponse[],
  // @todo: Create a fitting ClearanceField interface.
  // clearance?: Clearance[],
): SchulconnexPersonsResponse[] {
  const visibleProperties = getClearedProperties(offerId);
  return identities.map((identity) =>
    plainToInstance(SchulconnexPersonsResponse, {
      pid: identity.pid,
      person: filterPerson(identity.person, visibleProperties),
      personenkontexte: (identity.personenkontexte ?? []).map((context) =>
        filterPersonContext(context, visibleProperties),
      ),
    }),
  );
}

function getClearedProperties(
  offerId: number,
): SchulconnexClearanceVisibleFields {
  // @todo: Implement clearance table with dummy data
  // @todo: Get clearance for client
  void offerId;

  // @todo: Develop actual list of properties to toggle clearance for.
  // @todo: Configure by app via clearance table
  return {
    name: true,
    role: true,
    groups: true,
    organization: true,
    email: true,
  };
}

function filterPerson(
  person: undefined | SchulconnexPerson,
  visibleProperties: SchulconnexClearanceVisibleFields,
): SchulconnexPerson | undefined {
  if (typeof person === 'undefined') {
    return undefined;
  }
  if (!visibleProperties.name) {
    person.name = undefined;
  }
  if (!visibleProperties.organization) {
    person.stammorganisation = undefined;
  }
  return person;
}

function filterPersonContext(
  context: SchulconnexPersonContext,
  visibleProperties: SchulconnexClearanceVisibleFields,
): SchulconnexPersonContext {
  if (!visibleProperties.role) {
    context.rolle = undefined;
  }
  if (!visibleProperties.organization) {
    context.organisation = undefined;
  }
  if (context.organisation && visibleProperties.organization) {
    context.organisation = filterOrganization(
      context.organisation,
      visibleProperties,
    );
  }
  if (!visibleProperties.email) {
    context.erreichbarkeiten = undefined;
  }
  if (!visibleProperties.groups) {
    context.gruppen = undefined;
  }
  if (context.gruppen && visibleProperties.groups) {
    context.gruppen = context.gruppen.map((group) =>
      filterGroup(group, visibleProperties),
    );
  }
  return context;
}

function filterOrganization(
  organization: SchulconnexOrganization,
  visibleProperties: SchulconnexClearanceVisibleFields,
): SchulconnexOrganization {
  void visibleProperties;
  // @todo: Implement if necessary.
  return organization;
}

function filterGroup(
  group: SchulconnexGroupdataset,
  visibleProperties: SchulconnexClearanceVisibleFields,
): SchulconnexGroupdataset {
  void visibleProperties;
  // @todo: Implement if necessary.
  return group;
}
