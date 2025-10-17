import { ApiProperty } from '@nestjs/swagger';

export class SchulconnexBirth {
  @ApiProperty({
    description: 'The date of birth',
    nullable: true,
  })
  datum?: string | null;

  @ApiProperty({
    description: 'Indicates if the person is of legal age',
    nullable: true,
  })
  volljaehrig?: boolean | null;

  @ApiProperty({
    description: 'Place of birth',
    nullable: true,
  })
  geburtsort?: string | null;
}
