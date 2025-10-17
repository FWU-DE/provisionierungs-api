import { transformSchulconnexResponse } from './schulconnex.transformer';
import { type SchulconnexResponse } from './schulconnex-response.interface';

describe('SchulconnexTransformer', () => {
  describe('transformSchulconnexResponse', () => {
    it('should transform response correctly', () => {
      // Mock data
      const mockResponse: SchulconnexResponse[] = [
        {
          pid: 'person1',
          person: {
            name: {
              vorname: 'Test',
              familienname: 'User',
              initialenfamilienname: null,
              initialenvorname: null,
              rufname: null,
            },
            stammorganisation: {
              id: 'org1',
              kennung: null,
              name: '',
              anschrift: null,
              typ: 'SCHULE',
              traegerschaft: null,
            },
            geburt: null,
            geschlecht: null,
            lokalisierung: null,
            vertrauensstufe: null,
          },
          personenkontexte: [],
        },
      ];

      // Call the function
      const result = transformSchulconnexResponse(mockResponse);

      // Assertions
      expect(result).toBe(mockResponse); // Since it's just a type cast, the reference should be the same
      expect(result).toEqual(mockResponse);
    });

    it('should handle null input', () => {
      // Call the function with null
      const result = transformSchulconnexResponse(null);

      // Assertions
      expect(result).toEqual([]);
    });

    it('should handle empty array', () => {
      // Mock data
      const mockResponse: SchulconnexResponse[] = [];

      // Call the function
      const result = transformSchulconnexResponse(mockResponse);

      // Assertions
      expect(result).toEqual([]);
      expect(result).toBe(mockResponse); // Reference should be the same
    });

    it('should maintain the structure of the input', () => {
      // Mock data with a complex structure
      const mockResponse: SchulconnexResponse[] = [
        {
          pid: 'person1',
          person: {
            name: {
              vorname: 'Test',
              familienname: 'User',
              initialenfamilienname: null,
              initialenvorname: null,
              rufname: null,
            },
            stammorganisation: {
              id: 'org1',
              kennung: 'ORG1',
              name: 'Organization 1',
              anschrift: null,
              typ: 'SCHULE',
              traegerschaft: null,
            },
            geburt: {
              datum: '2000-01-01',
              volljaehrig: true,
              geburtsort: 'Berlin',
            },
            geschlecht: 'm',
            lokalisierung: null,
            vertrauensstufe: null,
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
                  ortsteil: null,
                },
                typ: 'SCHULE',
                traegerschaft: null,
              },
              rolle: 'LERN',
              personenstatus: null,
              beziehungen: null,
              loeschung: null,
            },
          ],
        },
      ];

      // Call the function
      const result = transformSchulconnexResponse(mockResponse);

      // Assertions
      expect(result).toEqual(mockResponse);
      // Check that the result is a valid SchulconnexPersonsResponse[]
      expect(result[0].pid).toBe('person1');
      expect(result[0].person.name?.vorname).toBe('Test');
      expect(result[0].personenkontexte?.[0]?.rolle).toBe('LERN');
    });
  });
});
