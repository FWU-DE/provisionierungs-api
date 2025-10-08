import { SchulconnexPersonsResponse } from '../dto/schulconnex-persons-response.dto';
import { type SchulconnexQueryParameters } from '../controller/types/schulconnex';
import {
  type PartialSchulconnexPersonContext,
  type SchulconnexPersonContext,
} from '../dto/schulconnex-person-context.dto';
import {
  type SchulconnexClearanceShowFields,
  type SchulconnexClearanceVisibleFields,
} from './schulconnex-clearance-options.interface';
import {
  type PartialSchulconnexPerson,
  type SchulconnexPerson,
} from '../dto/schulconnex-person.dto';
import {
  type PartialSchulconnexOrganization,
  type SchulconnexOrganization,
} from '../dto/schulconnex-organization.dto';
import {
  type PartialSchulconnexGroupdataset,
  type SchulconnexGroupdataset,
} from '../dto/schulconnex-groupdataset.dto';
import { plainToInstance } from 'class-transformer';

export function applyClearanceFilter(
  clientId: string,
  identities: SchulconnexPersonsResponse[],
  parameters: SchulconnexQueryParameters,
): SchulconnexPersonsResponse[] {
  /*
   * Data filtering
   */
  const complete = parameters.vollstaendig?.split(',');
  const showFields = {
    users: complete?.includes('personen') ?? false,
    userContexts: complete?.includes('personenkontexte') ?? false,
    groups: complete?.includes('gruppen') ?? false,
    organizations: complete?.includes('organisationen') ?? false,
    relations: complete?.includes('beziehungen') ?? false,
  };

  const visibleProperties = getVisibleProperties(clientId);

  // Apply visibility
  return identities.map((identity) =>
    plainToInstance(SchulconnexPersonsResponse, {
      pid: identity.pid,
      person: filterPerson(identity.person, showFields, visibleProperties),

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      personenkontexte: (identity.personenkontexte ?? []).map((context) =>
        filterPersonContext(context, showFields, visibleProperties),
      ),
    }),
  );
}

function getVisibleProperties(
  clientId: string,
): SchulconnexClearanceVisibleFields {
  // @todo: Implement clearance table with dummy data
  // @todo: Get clearance for client
  void clientId;

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
  person: undefined | PartialSchulconnexPerson | SchulconnexPerson,
  showFields: SchulconnexClearanceShowFields,
  visibleProperties: SchulconnexClearanceVisibleFields,
): SchulconnexPerson | PartialSchulconnexPerson | undefined {
  if (typeof person === 'undefined') {
    return undefined;
  }
  if (!showFields.users) {
    return undefined;
  }

  const filteredPerson: SchulconnexPerson | PartialSchulconnexPerson = {};
  if (visibleProperties.name) {
    filteredPerson.name = person.name;
  }
  if (showFields.organizations && visibleProperties.organization) {
    filteredPerson.stammorganisation = person.stammorganisation;
  }

  return filteredPerson;
}

function filterPersonContext(
  context: SchulconnexPersonContext | PartialSchulconnexPersonContext,
  showFields: SchulconnexClearanceShowFields,
  visibleProperties: SchulconnexClearanceVisibleFields,
): PartialSchulconnexPersonContext {
  const filteredContext: PartialSchulconnexPersonContext = {
    id: context.id,
    loeschung: context.loeschung,
  };

  if (!showFields.userContexts) {
    return filteredContext;
  }

  if (visibleProperties.role) {
    filteredContext.rolle = context.rolle;
  }
  if (context.organisation && visibleProperties.organization) {
    filteredContext.organisation = filterOrganization(
      context.organisation,
      showFields,
    );
  }
  if (visibleProperties.email) {
    filteredContext.erreichbarkeiten = context.erreichbarkeiten;
  }
  if (context.gruppen && visibleProperties.groups) {
    filteredContext.gruppen = context.gruppen.map((group) =>
      filterGroup(group, showFields),
    );
  }

  return filteredContext;
}

function filterOrganization(
  organization: SchulconnexOrganization | PartialSchulconnexOrganization,
  showFields: SchulconnexClearanceShowFields,
): PartialSchulconnexOrganization {
  if (!showFields.organizations) {
    return { id: organization.id };
  }

  return organization;
}

function filterGroup(
  group: SchulconnexGroupdataset | PartialSchulconnexGroupdataset,
  showFields: SchulconnexClearanceShowFields,
): PartialSchulconnexGroupdataset {
  if (!showFields.groups) {
    return { gruppe: { id: group.gruppe.id } };
  }

  return group;
}
