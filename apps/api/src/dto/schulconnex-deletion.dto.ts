import { ApiProperty } from '@nestjs/swagger';

export class SchulconnexDeletion {
  @ApiProperty({
    description: 'The deletion timestamp',
  })
  zeitpunkt!: Date;
}
