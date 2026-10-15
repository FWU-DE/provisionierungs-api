import { ApiProperty } from '@nestjs/swagger';

export class SchulconnexVerwaltungspolitischeKodierung {
  @ApiProperty({
    description: 'The state',
    enum: [
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
    ],
    nullable: true,
  })
  bundesland?:
    | '01'
    | '02'
    | '03'
    | '04'
    | '05'
    | '06'
    | '07'
    | '08'
    | '09'
    | '10'
    | '11'
    | '12'
    | '13'
    | '14'
    | '15'
    | '16'
    | null;
}

export class SchulconnexAddress {
  @ApiProperty({
    description: 'The ZIP Code',
    example: '38100',
    nullable: true,
  })
  postleitzahl?: string | null;

  @ApiProperty({
    description: 'The city',
    example: 'Braunschweig',
    nullable: true,
  })
  ort?: string | null;

  @ApiProperty({
    description: 'The district',
    example: 'Gliesmarode',
    nullable: true,
  })
  ortsteil?: string | null;

  @ApiProperty({
    description: 'The administrative coding of the address',
    type: SchulconnexVerwaltungspolitischeKodierung,
    nullable: true,
  })
  verwaltungspolitischekodierung?: SchulconnexVerwaltungspolitischeKodierung | null;
}
