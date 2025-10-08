import { ApiProperty } from '@nestjs/swagger';

export class SchulconnexContactOptions {
  @ApiProperty({
    description: 'The type of the contact option.',
    example: 'E-Mail',
    enum: ['E-Mail'],
  })
  typ!: 'E-Mail';

  @ApiProperty({
    description: 'The value specific to the type.',
    example: 'max.mustermann@test.local',
  })
  kennung!: string;
}
