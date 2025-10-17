import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import type { PartialSchulconnexPersonContext } from './schulconnex-person-context.dto';
import { SchulconnexPersonContext } from './schulconnex-person-context.dto';
import type { PartialSchulconnexPerson } from './schulconnex-person.dto';

export class SchulconnexPersonsResponse {
  @ApiProperty({
    description: 'The pseudonymous ID of the user.',
    example: '1e08bf41-4c41-4758-bf16-0d323a313289',
  })
  @IsNotEmpty()
  @IsString()
  pid!: string;

  @ApiProperty({
    description: 'The person',
  })
  person!: PartialSchulconnexPerson;

  @ApiProperty({
    description: 'The person context',
    type: SchulconnexPersonContext,
    isArray: true,
    nullable: true,
  })
  personenkontexte?: PartialSchulconnexPersonContext[] | null;
}
