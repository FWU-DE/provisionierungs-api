import { ApiProperty } from '@nestjs/swagger';

export class SchulconnexAddress {
  @ApiProperty({
    description: 'The ZIP Code',
    example: '38100',
    nullable: true,
  })
  postleitzahl!: string | null;
  @ApiProperty({
    description: 'The city',
    example: 'Braunschweig',
    nullable: true,
  })
  ort!: string | null;
}
