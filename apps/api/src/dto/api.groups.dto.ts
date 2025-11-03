import { ApiProperty } from '@nestjs/swagger';
import { SchulconnexGroup } from './schulconnex-group.dto';

export class ApiGroupsDto {
  @ApiProperty({
    description: 'ID of the owning IDP',
  })
  idp!: string;

  @ApiProperty({
    description: 'List of groups',
    isArray: true,
    type: SchulconnexGroup,
  })
  groups!: SchulconnexGroup[];
}
