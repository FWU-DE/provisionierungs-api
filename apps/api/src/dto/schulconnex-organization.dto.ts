import { ApiProperty } from '@nestjs/swagger';

import { SchulconnexAddress } from './schulconnex-address.dto';
import type { Identity, PartialExcept } from '@fwu-rostering/utils/typescript';

export class SchulconnexOrganization {
  @ApiProperty({
    description: 'The ID of the organization',
    example: 'd7e817af-a784-4dc7-923f-ca1f182e6af5',
  })
  id!: string;

  @ApiProperty({
    description: 'Official ID for the organization',
    example: 'NI_12345',
    nullable: true,
  })
  kennung?: string | null;

  @ApiProperty({
    description: 'Human readable name',
    example: 'Schloss Einstein Internat',
    nullable: true,
  })
  name?: string | null;

  @ApiProperty({
    description: 'The address of the organization',
    type: SchulconnexAddress,
    nullable: true,
  })
  anschrift?: SchulconnexAddress | null;

  @ApiProperty({
    description: 'The type of the organization',
    enum: ['SCHULE', 'ANBIETER', 'SONSTIGE'],
  })
  typ?: 'SCHULE' | 'ANBIETER' | 'SONSTIGE' | null;

  @ApiProperty({
    description: 'The authority/operator of the organization',
    nullable: true,
    enum: ['01', '02', '03', '04', '05', '06'],
  })
  traegerschaft?: '01' | '02' | '03' | '04' | '05' | '06' | null;
}

export type PartialSchulconnexOrganization = Identity<
  PartialExcept<SchulconnexOrganization, 'id'>
>;
