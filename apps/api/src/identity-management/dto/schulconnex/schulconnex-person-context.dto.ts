import { ApiProperty } from '@nestjs/swagger';

import { SchulconnexContactOptions } from './schulconnex-contact-options.dto';
import { SchulconnexDeletion } from './schulconnex-deletion.dto';
import { SchulconnexGroupdataset } from './schulconnex-groupdataset.dto';
import { SchulconnexOrganization } from './schulconnex-organization.dto';
import { SchulconnexRelations } from './schulconnex-relations.dto';

export class SchulconnexPersonContext {
  @ApiProperty({
    description: 'The ID of the context',
    example: '4fbf457e-1f7c-445d-b127-3b8c851e524d',
  })
  id!: string;

  @ApiProperty({
    description: 'The organization the user and this context belongs to',
    nullable: true,
    type: SchulconnexOrganization,
  })
  organisation?: SchulconnexOrganization | null;

  // s. https://schulconnex.de/docs/codelisten/#rolle
  @ApiProperty({
    description: 'The role of the user in this context.',
    enum: [
      'Lern',
      'Lehr',
      'SorgBer',
      'Extern',
      'OrgAdmin',
      'Leit',
      'SysAdmin',
      'SchB',
      'NLehr',
    ],
    nullable: true,
  })
  rolle?:
    | 'Lern'
    | 'Lehr'
    | 'SorgBer'
    | 'Extern'
    | 'OrgAdmin'
    | 'Leit'
    | 'SysAdmin'
    | 'SchB'
    | 'NLehr'
    | null;

  @ApiProperty({
    description: 'Contact options such as e-mail',
    type: SchulconnexContactOptions,
    isArray: true,
    nullable: true,
  })
  erreichbarkeiten?: SchulconnexContactOptions[] | null;

  @ApiProperty({
    description:
      'Status of the person\'s role in the organization. Currently only "Aktiv" is supported. Null if the user is not active in the organization.',
    nullable: true,
    example: 'Aktiv',
  })
  personenstatus?: 'Aktiv' | null;

  @ApiProperty({
    description: 'The groups the user is a member of',
    type: SchulconnexGroupdataset,
    isArray: true,
    nullable: true,
  })
  gruppen?: SchulconnexGroupdataset[] | null;

  @ApiProperty({
    description: 'The relations a person has to another person',
    nullable: true,
    type: SchulconnexRelations,
  })
  beziehungen?: SchulconnexRelations | null;

  @ApiProperty({
    description: 'The deletion information. Null if the user is not deleted.',
    nullable: true,
    type: SchulconnexDeletion,
  })
  loeschung?: SchulconnexDeletion | null;
}
