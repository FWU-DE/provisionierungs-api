import { ApiProperty } from '@nestjs/swagger';

import type { PartialSchulconnexGroup } from './schulconnex-group.dto';
import { SchulconnexGroup } from './schulconnex-group.dto';
import { SchulconnexGroupRelation } from './schulconnex-group-relation.dto';

export class SchulconnexGroupdataset {
  @ApiProperty({
    description: 'The group dataset',
    nullable: true,
  })
  gruppe?: SchulconnexGroup | null;

  @ApiProperty({
    description: "A relation between a person's context and a group.",
    nullable: true,
    type: SchulconnexGroupRelation,
  })
  gruppenzugehoerigkeit?: SchulconnexGroupRelation | null;

  @ApiProperty({
    description: 'Additional relations of persons to a group.',
    nullable: true,
    type: SchulconnexGroupRelation,
    isArray: true,
  })
  sonstige_gruppenzugehoerige?: SchulconnexGroupRelation[] | null;
}

export interface PartialSchulconnexGroupdataset {
  gruppe?: PartialSchulconnexGroup | null;
}
