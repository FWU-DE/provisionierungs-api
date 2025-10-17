import type { PartialExcept } from '@fwu-rostering/utils/typescript';
import { ApiProperty } from '@nestjs/swagger';
import { SchulconnexDuration } from './schulconnex.duration.dto';

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
  orgid?: string;

  @ApiProperty({
    description: 'The human readable name of the group',
    examples: ['Klasse 5a', 'Kollegium', 'Admins'],
    example: 'Klasse 5a',
  })
  bezeichnung?: string;

  @ApiProperty({
    description: 'The topic of the group',
    nullable: true,
    example: 'Klasse 5a',
  })
  thema?: string | null;

  @ApiProperty({
    description: 'The description of the group',
    nullable: true,
    example: 'Alle Schueler der Klasse 5a',
  })
  beschreibung?: string | null;

  @ApiProperty({
    description:
      'The type of the group. Currently, only "Sonstig" is supported.',
    nullable: true,
    enum: ['Sonstig', 'Klasse', 'Kurs'],
    example: 'Sonstig',
  })
  typ?: 'Sonstig' | 'Klasse' | 'Kurs' | null;

  @ApiProperty({
    description: 'The subject type of the group.',
    nullable: true,
    enum: ['Pflicht', 'Wahl', 'Wahlpflicht', 'Grundkurs', 'Leistungskurs'],
    example: 'Wahl',
  })
  bereich?:
    | 'Pflicht'
    | 'Wahl'
    | 'Wahlpflicht'
    | 'Grundkurs'
    | 'Leistungskurs'
    | null;

  @ApiProperty({
    description: 'Additional descriptors of the group',
    nullable: true,
    isArray: true,
    example: ['bilingual'],
  })
  optionen?: string[] | null;

  @ApiProperty({
    description: 'The course level of the group.',
    nullable: true,
    example: 'G',
  })
  differenzierung?: string | null;

  @ApiProperty({
    description: 'The educational objectives of the group.',
    nullable: true,
    isArray: true,
    example: ['GS', 'RS'],
  })
  bildungsziele?: string[] | null;

  @ApiProperty({
    description: 'The grade levels of the group.',
    nullable: true,
    isArray: true,
    example: ['05', '06'],
  })
  jahrgangsstufen?: string[] | null;

  @ApiProperty({
    description: 'The school subjects of the group.',
    nullable: true,
    isArray: true,
    example: ['NAT', 'EN', 'SP'],
  })
  faecher?: string[] | null;

  @ApiProperty({
    description: 'The duration of the group.',
    nullable: true,
    type: SchulconnexDuration,
  })
  laufzeit?: SchulconnexDuration | null;
}

export type PartialSchulconnexGroup = PartialExcept<SchulconnexGroup, 'id'>;
