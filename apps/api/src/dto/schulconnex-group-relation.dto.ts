import { ApiProperty } from '@nestjs/swagger';

export class SchulconnexGroupRelation {
  @ApiProperty({
    description: 'The ID of the related person',
    example: '4fbf457e-1f7c-445d-b127-3b8c851e524d',
    nullable: true,
  })
  ktid?: string | null;

  @ApiProperty({
    description: 'Roles of the person within the group.',
    nullable: true,
  })
  rollen?:
    | (
        | 'Lern'
        | 'Lehr'
        | 'KlLeit'
        | 'Foerd'
        | 'VLehr'
        | 'SchB'
        | 'GMit'
        | 'GLeit'
      )[]
    | null;

  @ApiProperty({
    description:
      'Start of group membership. This date may also be in the future.',
    nullable: true,
    example: '2024-01-01',
  })
  von?: Date | null;

  @ApiProperty({
    description: 'End of group membership.',
    nullable: true,
    example: '2024-07-31',
  })
  bis?: Date | null;
}
