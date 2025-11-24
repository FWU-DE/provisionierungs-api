import { ApiProperty } from '@nestjs/swagger';
import { SchulconnexRelation } from './schulconnex-relation.dto';

export class SchulconnexRelations {
  @ApiProperty({
    description: 'Array of relationships where this person has a role',
    isArray: true,
    nullable: true,
  })
  hat_als?: SchulconnexRelation[] | null;

  @ApiProperty({
    description: 'Array of relationships where this person is related to',
    isArray: true,
    nullable: true,
  })
  ist_von?: SchulconnexRelation[] | null;
}
