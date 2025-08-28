import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import type { Response } from 'express';
import {
  IdentityProvider,
  IdentityResult,
} from '../identity-provider/identity-provider';

import type {
  PartialSchulconnexGroupdataset,
  SchulconnexGroupdataset,
} from './dto/schulconnex-groupdataset.dto';
import type {
  PartialSchulconnexOrganization,
  SchulconnexOrganization,
} from './dto/schulconnex-organization.dto';
import type {
  PartialSchulconnexPersonContext,
  SchulconnexPersonContext,
} from './dto/schulconnex-person-context.dto';
import type { SchulconnexPerson } from './dto/schulconnex-person.dto';
import { SchulconnexPersonsResponse } from './dto/schulconnex-persons-response.dto';
import type {
  SchulconnexModelTransformerShowFields,
  SchulconnexModelTransformerVisibleFields,
} from './interfaces/schulconnex-model-transformer-options.interface';

@Controller('schulconnex/v1')
export class PersonenInfoController {
  constructor(private readonly identityProvider: IdentityProvider) {}

  @Get('personen-info')
  // TODO: AUTH
  // @AllowResourceOwnerType(ResourceOwnerType.CLIENT)
  // @RequireScope(MixedScopeIdentifier.EDUPLACES_IDM_PEOPLE_READ)
  @ApiResponse({
    status: 200,
    description: 'Read all users',
    type: [SchulconnexPersonsResponse],
  })
  @ApiQuery({
    name: 'vollstaendig',
    description: 'Comma separated list of fields to show',
    type: 'string',
    required: false,
    style: 'form',
    isArray: true,
    enum: [
      'personen',
      'personenkontexte',
      'organisationen',
      'gruppen',
      'beziehungen',
    ],
    explode: false,
  })
  @ApiQuery({
    name: 'organisation.id',
    description: 'Only show users from this organization',
    type: 'string',
    required: false,
    example: '3ab7d69a-379b-4d20-b6ea-60820ab503c3',
  })
  @ApiQuery({
    name: 'gruppe.id',
    description: 'Only show users that are members of this group',
    type: 'string',
    required: false,
    example: '519f7c2c-3743-4e9a-977b-f864ad6e1234',
  })
  @ApiQuery({
    name: 'pid',
    description: 'Only show the user with this pid',
    type: 'string',
    required: false,
    example: '400f5163-336c-4882-8897-c66da1fba5cf',
  })
  @ApiBearerAuth()
  async getUsers(
    @Res({ passthrough: true }) res: Response,
    @Query('vollstaendig') // comma separated string
    completeRaw?: string,
    @Query('organisation.id')
    organizationIdFilter?: string,
    @Query('gruppe.id')
    groupIdFilter?: string,
    @Query('pid')
    pidFilter?: string,
  ): Promise<SchulconnexPersonsResponse[]> {
    const appId = 'some-app-id'; // TODO: From token
    const schoolIds = ['some-school-id']; // TODO: From configuration
    if (
      [pidFilter, organizationIdFilter, groupIdFilter].filter(
        (filter) => filter,
      ).length > 1
    ) {
      // TODO: Can we lift this limitation?
      throw new BadRequestException(
        'Only one of "pid", "organisation.id" and "gruppe.id" can be used at the same time.',
      );
    }

    let identities: IdentityResult[] = [];
    if (pidFilter) {
      const identity = await this.identityProvider.getPersonByPseudonymForApp(
        appId,
        pidFilter,
      );
      if (identity) {
        identities = [identity];
      }
    } else if (groupIdFilter) {
      identities =
        await this.identityProvider.getPersonsWithGroupmembershipsForApp(
          appId,
          groupIdFilter,
        );
    } else {
      identities = await this.identityProvider.getPersonsAndGroupsForApp(
        appId,
        schoolIds,
      );
    }

    const complete = completeRaw?.split(',');
    const showFields = {
      users: complete?.includes('personen') ?? false,
      userContexts: complete?.includes('personenkontexte') ?? false,
      organizations: complete?.includes('organisationen') ?? false,
      groups: complete?.includes('gruppen') ?? false,
      relations: complete?.includes('beziehungen') ?? false,
    };

    // Spec says we need to send an ETag header
    // However, we do not support caching yet, therefore we just send a dummy value
    res.header('ETag', `W/"${(Math.random() + 1).toString(36)}"`);

    const visibleProperties = this.getVisibleProperties();

    return await Promise.all(
      // Promise.all Probably needed for pseudonymization in future
      // eslint-disable-next-line @typescript-eslint/require-await
      identities.map(async (result) => {
        const response: SchulconnexPersonsResponse = {
          pid: result.pid,
          person: this.transformPerson(
            result.person,
            showFields,
            visibleProperties,
          ),

          personenkontexte: result.personenkontexte.map((context) =>
            this.transformPersonContext(context, showFields, visibleProperties),
          ),
        };

        return plainToInstance(SchulconnexPersonsResponse, response);
      }),
    );
  }

  private getVisibleProperties(): SchulconnexModelTransformerVisibleFields {
    // TODO: Configure by app
    return {
      name: true,
      role: true,
      groups: true,
      organization: true,
      email: true,
    };
  }

  private transformPerson(
    person: SchulconnexPerson,
    showFields: SchulconnexModelTransformerShowFields,
    visibleProperties: SchulconnexModelTransformerVisibleFields,
  ): SchulconnexPerson | undefined {
    if (!showFields.users) {
      return undefined;
    }

    const transformedPerson: SchulconnexPerson = {};
    if (visibleProperties.name) {
      transformedPerson.name = person.name;
    }
    if (showFields.organizations && visibleProperties.organization) {
      transformedPerson.stammorganisation = person.stammorganisation;
    }

    return transformedPerson;
  }

  private transformPersonContext(
    context: SchulconnexPersonContext,
    showFields: SchulconnexModelTransformerShowFields,
    visibleProperties: SchulconnexModelTransformerVisibleFields,
  ): PartialSchulconnexPersonContext {
    const transformedContext: PartialSchulconnexPersonContext = {
      id: context.id,
      loeschung: context.loeschung,
    };

    if (!showFields.userContexts) {
      return transformedContext;
    }

    if (visibleProperties.role) {
      transformedContext.rolle = context.rolle;
    }
    if (context.organisation && visibleProperties.organization) {
      transformedContext.organisation = this.transformOrganization(
        context.organisation,
        showFields,
      );
    }
    if (visibleProperties.email) {
      transformedContext.erreichbarkeiten = context.erreichbarkeiten;
    }
    if (context.gruppen && visibleProperties.groups) {
      transformedContext.gruppen = context.gruppen.map((group) =>
        this.transformGroup(group, showFields),
      );
    }

    return transformedContext;
  }

  private transformOrganization(
    organization: SchulconnexOrganization,
    showFields: SchulconnexModelTransformerShowFields,
  ): PartialSchulconnexOrganization {
    if (!showFields.organizations) {
      return { id: organization.id };
    }

    return organization;
  }

  private transformGroup(
    group: SchulconnexGroupdataset,
    showFields: SchulconnexModelTransformerShowFields,
  ): PartialSchulconnexGroupdataset {
    if (!showFields.groups) {
      return { gruppe: { id: group.gruppe.id } };
    }

    return group;
  }
}
