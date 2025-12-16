import { ApiProperty } from '@nestjs/swagger';

export class SchulconnexFach {
  @ApiProperty({
    description: 'The human readable name of the class',
    examples: ['Biologie', 'Chemie', 'Chinesisch'],
    example: 'Erdkunde',
  })
  bezeichnung?: string;
}
