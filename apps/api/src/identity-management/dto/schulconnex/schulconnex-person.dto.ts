import { ApiProperty } from '@nestjs/swagger';

import { SchulconnexName } from './schulconnex-name.dto';
import { SchulconnexOrganization } from './schulconnex-organization.dto';
import { SchulconnexBirth } from './schulconnex-birth.dto';

export class SchulconnexPerson {
  @ApiProperty({
    description: 'The main organization for that user',
    nullable: true,
    type: SchulconnexOrganization,
  })
  stammorganisation?: SchulconnexOrganization | null;

  @ApiProperty({
    description: 'The name of the person. Null if the name is not requested.',
    nullable: true,
    type: SchulconnexName,
  })
  name?: SchulconnexName | null;

  @ApiProperty({
    description: 'The age information of the person.',
    nullable: true,
    type: SchulconnexBirth,
  })
  geburt?: SchulconnexBirth | null;

  @ApiProperty({
    description: 'The gender information of the person.',
    nullable: true,
    enum: ['m', 'w', 'd', 'x'],
  })
  geschlecht?: 'm' | 'w' | 'd' | 'x' | null;

  @ApiProperty({
    description: 'The language of the person.',
    nullable: true,
    examples: ['de', 'de-DE', 'en', 'en-GB'],
  })
  lokalisierung?: string | null;

  @ApiProperty({
    description: 'The trust level of the person.',
    nullable: true,
    enum: ['Kein', 'Unbe', 'Teil', 'Voll'],
  })
  vertrauensstufe?: 'Kein' | 'Unbe' | 'Teil' | 'Voll' | null;
}
