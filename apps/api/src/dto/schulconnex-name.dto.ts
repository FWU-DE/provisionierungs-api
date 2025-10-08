import { ApiProperty } from '@nestjs/swagger';

export class SchulconnexName {
  @ApiProperty({
    description: 'The family name of the person.',
    example: 'Mustermann',
  })
  familienname!: string;

  @ApiProperty({
    description: 'The given name of the person.',
    example: 'Max',
  })
  vorname!: string;

  @ApiProperty({
    description: 'The initials of the family name of the person.',
    nullable: true,
    example: 'M',
  })
  initialenfamilienname!: string | null;

  @ApiProperty({
    description: 'The initials of the given name of the person.',
    nullable: true,
    example: 'M',
  })
  initialenvorname!: string | null;

  @ApiProperty({
    description:
      'The call name of the person, in case of multiple given names.',
    nullable: true,
    example: 'Max',
  })
  rufname!: string | null;
}
