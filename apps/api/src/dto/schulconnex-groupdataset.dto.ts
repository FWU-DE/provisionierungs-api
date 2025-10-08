import { ApiProperty } from '@nestjs/swagger';

import type { PartialSchulconnexGroup } from './schulconnex-group.dto';
import { SchulconnexGroup } from './schulconnex-group.dto';

export class SchulconnexGroupdataset {
  @ApiProperty({
    description: 'The group dataset',
  })
  gruppe!: SchulconnexGroup;
}

export interface PartialSchulconnexGroupdataset {
  gruppe: PartialSchulconnexGroup;
}
