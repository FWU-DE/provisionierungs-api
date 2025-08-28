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
}
