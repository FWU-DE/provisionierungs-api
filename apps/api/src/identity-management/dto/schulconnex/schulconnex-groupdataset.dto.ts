import { ApiProperty } from '@nestjs/swagger';

import { SchulconnexGroupRelation } from './schulconnex-group-relation.dto';
import { SchulconnexGroup } from './schulconnex-group.dto';

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
