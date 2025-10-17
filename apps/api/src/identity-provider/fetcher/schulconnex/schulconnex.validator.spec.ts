import { schulconnexUsersResponseSchema } from './schulconnex.validator';
import { type SchulconnexResponse } from './schulconnex-response.interface';

describe('SchulconnexValidator', () => {
  describe('schulconnexUsersResponseSchema', () => {
    it('should validate a valid response', () => {
      // Mock data with minimal required fields
      const mockResponse: SchulconnexResponse[] = [
        {
          pid: 'person1',
          person: {
            name: {
              vorname: 'Test',
              familienname: 'User',
            },
            stammorganisation: {
              id: 'org1',
              typ: 'SCHULE',
            },
          },
        },
      ];

      // Validate the data
      const result = schulconnexUsersResponseSchema.safeParse(mockResponse);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should validate a complex valid response', () => {
      // Mock data with more fields
      const mockResponse: SchulconnexResponse[] = [
        {
          pid: 'person1',
          person: {
            name: {
              vorname: 'Test',
              familienname: 'User',
            },
            stammorganisation: {
              id: 'org1',
              kennung: 'ORG1',
              name: 'Organization 1',
              typ: 'SCHULE',
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
                },
                typ: 'SCHULE',
              },
              rolle: 'LERN',
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
                  },
                },
              ],
            },
          ],
        },
      ];

      // Validate the data
      const result = schulconnexUsersResponseSchema.safeParse(mockResponse);

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
      const result = schulconnexUsersResponseSchema.safeParse(mockResponse);

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
      const result = schulconnexUsersResponseSchema.safeParse(mockResponse);

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
      const result = schulconnexUsersResponseSchema.safeParse(mockResponse);

      // Assertions
      expect(result.success).toBe(false);
    });

    it('should accept response with optional fields missing', () => {
      // Mock data with minimal required fields
      const mockResponse: SchulconnexResponse[] = [
        {
          pid: 'person1',
          // person is optional
          // personenkontexte is optional
        },
      ];

      // Validate the data
      const result = schulconnexUsersResponseSchema.safeParse(mockResponse);

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should accept empty array', () => {
      // Empty array
      const mockResponse: SchulconnexResponse[] = [];

      // Validate the data
      const result = schulconnexUsersResponseSchema.safeParse(mockResponse);

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
      const result = schulconnexUsersResponseSchema.safeParse(mockResponse);

      // Assertions
      expect(result.success).toBe(false);
    });
  });
});
