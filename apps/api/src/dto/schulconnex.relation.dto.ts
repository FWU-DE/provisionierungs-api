import { ApiProperty } from '@nestjs/swagger';

export class SchulconnexRelation {
  @ApiProperty({
    description: 'The ID of the related person',
    example: '4fbf457e-1f7c-445d-b127-3b8c851e524d',
  })
  ktid!: string;

  @ApiProperty({
    description: 'The type of relationship',
    enum: ['SorgBer', 'SchB'],
    example: 'SorgBer',
  })
  beziehung!: 'SorgBer' | 'SchB';
}
