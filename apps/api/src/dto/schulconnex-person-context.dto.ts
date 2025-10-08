import { ApiProperty } from '@nestjs/swagger';

import { SchulconnexContactOptions } from './schulconnex-contact-options.dto';
import { SchulconnexDeletion } from './schulconnex-deletion.dto';
import type { PartialSchulconnexGroupdataset } from './schulconnex-groupdataset.dto';
import { SchulconnexGroupdataset } from './schulconnex-groupdataset.dto';
import type { PartialSchulconnexOrganization } from './schulconnex-organization.dto';
import { SchulconnexOrganization } from './schulconnex-organization.dto';
import type { Identity, PartialExcept } from '@fwu-rostering/utils/typescript';
import { SchulconnexRelations } from './schulconnex.relations.dto';

export class SchulconnexPersonContext {
  @ApiProperty({
    description: 'The ID of the context',
    example: '4fbf457e-1f7c-445d-b127-3b8c851e524d',
  })
  id!: string;

  @ApiProperty({
    description: 'The organization the user and this context belongs to',
  })
  organisation?: SchulconnexOrganization;

  @ApiProperty({
    description:
      'The role of the user in this context. Currently only roles "LERN" and "LEHR" are supported.',
    enum: ['LERN', 'LEHR', 'SORGBER', 'EXTERN', 'ORGADMIN', 'LEIT', 'SYSADMIN'],
  })
  rolle?:
    | 'LERN'
    | 'LEHR'
    | 'SORGBER'
    | 'EXTERN'
    | 'ORGADMIN'
    | 'LEIT'
    | 'SYSADMIN';

  @ApiProperty({
    description: 'Contact options such as e-mail',
    type: SchulconnexContactOptions,
    isArray: true,
  })
  erreichbarkeiten?: SchulconnexContactOptions[];

  @ApiProperty({
    description:
      'Status of the person\'s role in the organization. Currently only "Aktiv" is supported. Null if the user is not active in the organization.',
    nullable: true,
    example: 'Aktiv',
  })
  personenstatus!: 'Aktiv' | null;

  @ApiProperty({
    description: 'The groups the user is a member of',
    type: SchulconnexGroupdataset,
    isArray: true,
  })
  gruppen?: SchulconnexGroupdataset[];

  @ApiProperty({
    description: 'The relations a person has to another person',
    nullable: true,
    type: SchulconnexRelations,
  })
  beziehungen!: SchulconnexRelations | null;

  @ApiProperty({
    description: 'The deletion information. Null if the user is not deleted.',
    nullable: true,
    type: SchulconnexDeletion,
  })
  loeschung!: SchulconnexDeletion | null;
}

export type PartialSchulconnexPersonContext = Identity<
  PartialExcept<
    Omit<SchulconnexPersonContext, 'organisation' | 'gruppen'>,
    'loeschung' | 'id'
  > & {
    organisation?: PartialSchulconnexOrganization;
    gruppen?: PartialSchulconnexGroupdataset[];
  }
>;
