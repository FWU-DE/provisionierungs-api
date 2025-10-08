import { ApiProperty } from '@nestjs/swagger';

export class SchulconnexDuration {
  @ApiProperty({
    description: 'The start date',
    nullable: true,
    example: '2024-01-01',
  })
  von!: Date | null;

  @ApiProperty({
    description: 'The start learning period',
    nullable: true,
    example: '2023-1',
  })
  vonlernperiode!: string | null;

  @ApiProperty({
    description: 'The end date',
    nullable: true,
    example: '2024-07-31',
  })
  bis!: Date | null;

  @ApiProperty({
    description: 'The end learning period',
    nullable: true,
    example: '2024',
  })
  bislernperiode!: string | null;
}
