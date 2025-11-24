import { Injectable } from '@nestjs/common';
import { SchulconnexPersonsResponse } from '../dto/schulconnex/schulconnex-persons-response.dto';
import { SchulconnexQueryParameters } from '../../controller/parameters/schulconnex-query-parameters';
import { plainToInstance } from 'class-transformer';
import type { SchulconnexPerson } from '../dto/schulconnex/schulconnex-person.dto';
import type { SchulconnexPersonContext } from '../dto/schulconnex/schulconnex-person-context.dto';
import type { SchulconnexOrganization } from '../dto/schulconnex/schulconnex-organization.dto';
import type { SchulconnexGroupdataset } from '../dto/schulconnex/schulconnex-groupdataset.dto';

// Visible according to schulconnex spec
export interface SchulconnexShowFields {
  users: boolean;
  userContexts: boolean;
  organizations: boolean;
  groups: boolean;
  relations: boolean;
}

/**
 * This class is responsible for filtering the data received from the IDM
 * based on the request parameters.
 * It assures that only the data requested by the client is returned.
 * It should NOT check any data access permissions.
 */
@Injectable()
export class PostRequestFilter {
  public filterByQueryParameters(
    data: SchulconnexPersonsResponse[],
    parameters: SchulconnexQueryParameters,
  ): SchulconnexPersonsResponse[] {
    if (parameters.pid) {
      data = this.filterForPid(data, parameters.pid);
    }

    if (parameters['personenkontext.id']) {
      data = this.filterForPersonContextId(
        data,
        parameters['personenkontext.id'],
      );
    }

    if (parameters['gruppe.id']) {
      data = this.filterForGroupId(data, parameters['gruppe.id']);
    }

    if (parameters['organisation.id']) {
      data = this.filterForOrganizationId(data, parameters['organisation.id']);
    }

    data = this.filterForCompletion(data, parameters.vollstaendig);

    return data;
  }

  private filterForPid(
    data: SchulconnexPersonsResponse[],
    pid: string,
  ): SchulconnexPersonsResponse[] {
    return data.filter((item) => item.pid === pid);
  }

  private filterForPersonContextId(
    data: SchulconnexPersonsResponse[],
    personContextId: string,
  ): SchulconnexPersonsResponse[] {
    return data.filter((item) =>
      item.personenkontexte?.some((context) => context.id === personContextId),
    );
  }

  private filterForGroupId(
    data: SchulconnexPersonsResponse[],
    groupId: string,
  ): SchulconnexPersonsResponse[] {
    return data.filter((item) =>
      item.personenkontexte?.some((context) =>
        context.gruppen?.some((group) => group.gruppe?.id === groupId),
      ),
    );
  }

  private filterForOrganizationId(
    data: SchulconnexPersonsResponse[],
    organizationId: string,
  ): SchulconnexPersonsResponse[] {
    return data.filter((item) =>
      item.personenkontexte?.some(
        (context) => context.organisation?.id === organizationId,
      ),
    );
  }

  private filterForCompletion(
    identities: SchulconnexPersonsResponse[],
    complete: SchulconnexQueryParameters['vollstaendig'],
  ): SchulconnexPersonsResponse[] {
    const showFields = {
      users: complete.has('personen'),
      userContexts: complete.has('personenkontexte'),
      groups: complete.has('gruppen'),
      organizations: complete.has('organisationen'),
      relations: complete.has('beziehungen'),
    };

    // @todo: Remove 'beziehungen' data if not requested via 'vollstaendig'!

    return identities.map((identity) =>
      plainToInstance(SchulconnexPersonsResponse, {
        pid: identity.pid,
        person: this.filterPerson(identity.person, showFields),

        personenkontexte: (identity.personenkontexte ?? []).map((context) =>
          this.filterPersonContext(context, showFields),
        ),
      }),
    );
  }

  private filterPerson(
    person: undefined | SchulconnexPerson,
    showFields: SchulconnexShowFields,
  ): SchulconnexPerson | undefined {
    if (typeof person === 'undefined') {
      return undefined;
    }
    if (!showFields.users) {
      return undefined;
    }

    const filteredPerson: SchulconnexPerson = {};
    filteredPerson.name = person.name;
    if (person.stammorganisation && showFields.organizations) {
      filteredPerson.stammorganisation = this.filterOrganization(
        person.stammorganisation,
        showFields,
      );
    }

    return filteredPerson;
  }

  private filterPersonContext(
    context: SchulconnexPersonContext,
    showFields: SchulconnexShowFields,
  ): SchulconnexPersonContext {
    const filteredContext: SchulconnexPersonContext = {
      id: context.id,
      loeschung: context.loeschung,
    };

    if (!showFields.userContexts) {
      return filteredContext;
    }

    filteredContext.rolle = context.rolle;
    if (context.organisation) {
      filteredContext.organisation = this.filterOrganization(
        context.organisation,
        showFields,
      );
    }
    if (context.gruppen) {
      filteredContext.gruppen = context.gruppen.map((group) =>
        this.filterGroup(group, showFields),
      );
    }
    filteredContext.erreichbarkeiten = context.erreichbarkeiten;
    return filteredContext;
  }

  private filterOrganization(
    organization: SchulconnexOrganization,
    showFields: SchulconnexShowFields,
  ): SchulconnexOrganization {
    if (!showFields.organizations) {
      return { id: organization.id };
    }
    return organization;
  }

  private filterGroup(
    group: SchulconnexGroupdataset,
    showFields: SchulconnexShowFields,
  ): SchulconnexGroupdataset {
    if (!showFields.groups && group.gruppe) {
      return { gruppe: { id: group.gruppe.id } };
    }
    return group;
  }
}
