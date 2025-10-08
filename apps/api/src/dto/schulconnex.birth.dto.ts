import { ApiProperty } from '@nestjs/swagger';

export class SchulconnexBirth {
  @ApiProperty({
    description: 'The date of birth',
  })
  datum!: string;

  @ApiProperty({
    description: 'Indicates if the person is of legal age',
  })
  volljaehrig!: boolean;

  @ApiProperty({
    description: 'Place of birth',
  })
  geburtsort!: string;
}
