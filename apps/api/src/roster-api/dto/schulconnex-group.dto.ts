import type { PartialExcept } from '@fwu-rostering/utils/typescript';
import { ApiProperty } from '@nestjs/swagger';

export class SchulconnexGroup {
  @ApiProperty({
    description: 'The ID of the group',
    example: 'a8dc626e-2b59-47ba-8f68-fe5940a60df6',
  })
  id!: string;
  @ApiProperty({
    description: 'The associated organization ID',
    example: 'b1d02e65-73a1-4719-ae00-1b24356ab8ac',
  })
  orgid!: string;

  @ApiProperty({
    description: 'The human readable name of the group',
    examples: ['Klasse 5a', 'Kollegium', 'Admins'],
    example: 'Klasse 5a',
  })
  bezeichnung!: string;

  @ApiProperty({
    description:
      'The type of the group. Currently, only "Sonstig" is supported.',
    enum: ['Sonstig', 'Klasse', 'Kurs'],
    example: 'Sonstig',
  })
  typ!: 'Sonstig' | 'Klasse' | 'Kurs';
}

export type PartialSchulconnexGroup = PartialExcept<SchulconnexGroup, 'id'>;
