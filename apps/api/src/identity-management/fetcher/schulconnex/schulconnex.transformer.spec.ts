import { type SchulconnexPersonsResponse } from './schulconnex-response.interface';
import { transformSchulconnexPersonsResponse } from './schulconnex.transformer';

describe('SchulconnexTransformer', () => {
  describe('transformSchulconnexResponse', () => {
    it('should transform response correctly', () => {
      // Mock data
      const mockResponse: SchulconnexPersonsResponse[] = [
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
              typ: 'Schule',
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
      const result = transformSchulconnexPersonsResponse(mockResponse);

      // Assertions
      expect(result).toBe(mockResponse); // Since it's just a type cast, the reference should be the same
      expect(result).toEqual(mockResponse);
    });

    it('should handle null input', () => {
      // Call the function with null
      const result = transformSchulconnexPersonsResponse(null);

      // Assertions
      expect(result).toEqual([]);
    });

    it('should handle empty array', () => {
      // Mock data
      const mockResponse: SchulconnexPersonsResponse[] = [];

      // Call the function
      const result = transformSchulconnexPersonsResponse(mockResponse);

      // Assertions
      expect(result).toEqual([]);
      expect(result).toBe(mockResponse); // Reference should be the same
    });

    it('should maintain the structure of the input', () => {
      // Mock data with a complex structure
      const mockResponse: SchulconnexPersonsResponse[] = [
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
              typ: 'Schule',
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
                typ: 'Schule',
                traegerschaft: null,
              },
              rolle: 'Lern',
              personenstatus: null,
              beziehungen: null,
              loeschung: null,
            },
          ],
        },
      ];

      // Call the function
      const result = transformSchulconnexPersonsResponse(mockResponse);

      // Assertions
      expect(result).toEqual(mockResponse);
      expect(result[0]).toBeDefined();
      // Check that the result is a valid SchulconnexPersonsResponse[]
      expect(result[0].pid).toBe('person1');
      expect(result[0].person?.name?.vorname).toBe('Test');
      expect(result[0].personenkontexte?.[0]?.rolle).toBe('Lern');
    });
  });
});
