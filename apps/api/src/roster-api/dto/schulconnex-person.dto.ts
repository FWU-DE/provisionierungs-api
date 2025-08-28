import { ApiProperty } from '@nestjs/swagger';

import { SchulconnexName } from './schulconnex-name.dto';
import type { PartialSchulconnexOrganization } from './schulconnex-organization.dto';
import { SchulconnexOrganization } from './schulconnex-organization.dto';

export class SchulconnexPerson {
  @ApiProperty({
    description: 'The main organization for that user',
  })
  stammorganisation?: SchulconnexOrganization;

  @ApiProperty({
    description: 'The name of the person. Null if the name is not requested.',
    nullable: true,
    type: SchulconnexName,
  })
  name?: SchulconnexName | null;
}

export interface PartialSchulconnexPerson {
  name?: SchulconnexPerson['name'];
  stammorganisation?: PartialSchulconnexOrganization;
}
