import { type SchulconnexVerwaltungspolitischeKodierung } from '../../dto/schulconnex/schulconnex-address.dto';
import { type SchulconnexPersonsResponse } from './schulconnex-response.interface';
import { schulconnexPersonsResponseSchema } from './schulconnex.validator';

describe('SchulconnexValidator', () => {
  describe('schulconnexUsersResponseSchema', () => {
    it('should validate a valid response', () => {
      // Mock data with minimal required fields
      const mockResponse: SchulconnexPersonsResponse[] = [
        {
          pid: 'person1',
          person: {
            name: {
              vorname: 'Test',
              familienname: 'User',
            },
            stammorganisation: {
              id: 'org1',
              typ: 'Schule',
            },
          },
        },
      ];

      // Validate the data
      const result = schulconnexPersonsResponseSchema.safeParse(mockResponse);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should validate a complex valid response', () => {
      // Mock data with more fields
      const mockResponse: SchulconnexPersonsResponse[] = [
        {
          pid: 'person1',
          person: {
            name: {
              vorname: 'Test',
              familienname: 'User',
              initialenfamilienname: 'U',
              initialenvorname: 'T',
              rufname: 'Tester',
            },
            stammorganisation: {
              id: 'org1',
              kennung: 'ORG1',
              name: 'Organization 1',
              typ: 'Schule',
              traegerschaft: '01',
              anschrift: {
                postleitzahl: '12345',
                ort: 'Berlin',
                ortsteil: 'Mitte',
                verwaltungspolitischekodierung: {
                  bundesland: '11',
                },
              },
            },
            geburt: {
              datum: '2000-01-01',
              volljaehrig: true,
              geburtsort: 'Berlin',
            },
            geschlecht: 'm',
            lokalisierung: 'de',
            vertrauensstufe: 'Voll',
          },
          personenkontexte: [
            {
              id: 'context1',
              organisation: {
                id: 'org1',
                kennung: 'ORG1',
                name: 'Organization 1',
                anschrift: {
                  postleitzahl: '12345',
                  ort: 'Berlin',
                  ortsteil: 'Mitte',
                  verwaltungspolitischekodierung: {
                    bundesland: null,
                  },
                },
                typ: 'Schule',
                traegerschaft: '02',
              },
              rolle: 'Lern',
              personenstatus: 'Aktiv',
              erreichbarkeiten: [
                {
                  typ: 'E-Mail',
                  kennung: 'test@example.local',
                },
              ],
              gruppen: [
                {
                  gruppe: {
                    id: 'group1',
                    orgid: 'org1',
                    bezeichnung: 'Group 1',
                    thema: 'Theme',
                    beschreibung: 'Description',
                    typ: 'Sonstig',
                    bereich: 'Pflicht',
                    optionen: ['bilingual'],
                    differenzierung: 'G',
                    bildungsziele: ['GS'],
                    jahrgangsstufen: ['05'],
                    faecher: [{ bezeichnung: 'Mathe' }],
                    laufzeit: {
                      von: '2021-01-01',
                      vonlernperiode: '2021H1',
                      bis: '2022-12-31',
                      bislernperiode: '2022H2',
                    },
                  },
                  gruppenzugehoerigkeit: {
                    ktid: 'context1',
                    rollen: ['Lern'],
                    von: '2021-01-01' as unknown as Date,
                    bis: '2022-12-31' as unknown as Date,
                  },
                  sonstige_gruppenzugehoerige: [
                    {
                      ktid: 'context2',
                      rollen: ['Lehr'],
                      von: '2021-01-01' as unknown as Date,
                      bis: '2022-12-31' as unknown as Date,
                    },
                  ],
                },
              ],
              beziehungen: {
                hat_als: [
                  {
                    ktid: 'parent1',
                    beziehung: 'SorgBer',
                  },
                ],
                ist_von: [
                  {
                    ktid: 'child1',
                    beziehung: 'SorgBer',
                  },
                ],
              },
              loeschung: {
                zeitpunkt: '2023-01-01T00:00:00Z' as unknown as Date,
              },
            },
          ],
        },
      ];

      // Validate the data
      const result = schulconnexPersonsResponseSchema.safeParse(mockResponse);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should reject invalid response - missing required fields', () => {
      // Mock data with missing required fields
      const mockResponse = [
        {
          // Missing pid
          person: {
            name: {
              vorname: 'Test',
              familienname: 'User',
            },
            stammorganisation: {
              id: 'org1',
            },
          },
        },
      ];

      // Validate the data
      const result = schulconnexPersonsResponseSchema.safeParse(mockResponse);

      // Assertions
      expect(result.success).toBe(false);
    });

    it('should reject invalid response - wrong field types', () => {
      // Mock data with wrong field types
      const mockResponse = [
        {
          pid: 123, // Should be string
          person: {
            name: {
              vorname: 'Test',
              familienname: 'User',
            },
            stammorganisation: {
              id: 'org1',
            },
          },
        },
      ];

      // Validate the data
      const result = schulconnexPersonsResponseSchema.safeParse(mockResponse);

      // Assertions
      expect(result.success).toBe(false);
    });

    it('should reject invalid response - invalid enum value', () => {
      // Mock data with invalid enum value
      const mockResponse = [
        {
          pid: 'person1',
          person: {
            name: {
              vorname: 'Test',
              familienname: 'User',
            },
            stammorganisation: {
              id: 'org1',
            },
            geschlecht: 'invalid', // Should be 'm', 'w', 'd', or 'x'
          },
        },
      ];

      // Validate the data
      const result = schulconnexPersonsResponseSchema.safeParse(mockResponse);

      // Assertions
      expect(result.success).toBe(false);
    });

    it.each<[string, SchulconnexVerwaltungspolitischeKodierung | null | undefined]>([
      ['a valid bundesland', { bundesland: '01' }],
      ['the highest valid bundesland', { bundesland: '16' }],
      ['a null bundesland', { bundesland: null }],
      ['a missing bundesland', {}],
      ['a null verwaltungspolitischekodierung', null],
      ['a missing verwaltungspolitischekodierung', undefined],
    ])('should accept an anschrift with %s', (_, verwaltungspolitischekodierung) => {
      const mockResponse: SchulconnexPersonsResponse[] = [
        {
          pid: 'person1',
          person: {
            stammorganisation: {
              id: 'org1',
              anschrift: {
                ort: 'Berlin',
                verwaltungspolitischekodierung,
              },
            },
          },
        },
      ];

      const result = schulconnexPersonsResponseSchema.safeParse(mockResponse);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it.each([
      ['an unknown bundesland code', { bundesland: '17' }],
      ['a bundesland code without leading zero', { bundesland: '1' }],
      ['a numeric bundesland', { bundesland: 11 }],
      ['a bundesland name instead of a code', { bundesland: 'Berlin' }],
      ['a string verwaltungspolitischekodierung', '11'],
    ])('should reject an anschrift with %s', (_, verwaltungspolitischekodierung) => {
      const mockResponse = [
        {
          pid: 'person1',
          personenkontexte: [
            {
              organisation: {
                id: 'org1',
                anschrift: {
                  verwaltungspolitischekodierung,
                },
              },
            },
          ],
        },
      ];

      const result = schulconnexPersonsResponseSchema.safeParse(mockResponse);

      expect(result.success).toBe(false);
    });

    it('should accept response with optional fields missing', () => {
      // Mock data with minimal required fields
      const mockResponse: SchulconnexPersonsResponse[] = [
        {
          pid: 'person1',
          // person is optional
          // personenkontexte is optional
        },
      ];

      // Validate the data
      const result = schulconnexPersonsResponseSchema.safeParse(mockResponse);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should accept empty array', () => {
      // Empty array
      const mockResponse: SchulconnexPersonsResponse[] = [];

      // Validate the data
      const result = schulconnexPersonsResponseSchema.safeParse(mockResponse);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should reject non-array input', () => {
      // Non-array input
      const mockResponse = {
        pid: 'person1',
      };

      // Validate the data
      const result = schulconnexPersonsResponseSchema.safeParse(mockResponse);

      // Assertions
      expect(result.success).toBe(false);
    });
  });
});
