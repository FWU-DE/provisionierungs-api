import type { AdapterInterface } from './adapter-interface';
import type { SchulconnexQueryParameters } from '../../controller/types/schulconnex';

describe('AdapterInterface', () => {
  it('should handle getPersons method correctly', async () => {
    // Create a mock implementation
    const mockAdapter: AdapterInterface = {
      getIdentifier: () => 'test-adapter',
      getPersons: () =>
        Promise.resolve({
          idp: 'test-adapter',
          response: [
            {
              pid: 'test-pid',
              person: {
                name: {
                  vorname: 'Test',
                  familienname: 'User',
                  initialenfamilienname: null,
                  initialenvorname: null,
                  rufname: null,
                },
              },
              personenkontexte: [],
            },
          ],
        }),
    };

    // Test the getPersons method
    const mockParameters: SchulconnexQueryParameters = {};
    const result = await mockAdapter.getPersons(mockParameters);

    expect(result).toHaveProperty('idp', 'test-adapter');
    expect(result).toHaveProperty('response');
    expect(Array.isArray(result.response)).toBe(true);
    expect(result.response?.[0]).toHaveProperty('pid', 'test-pid');
  });

  it('should allow null response in AdapterGetPersonsReturnType', async () => {
    // Create a mock implementation that returns a null response
    const mockAdapter: AdapterInterface = {
      getIdentifier: () => 'test-adapter',
      getPersons: () =>
        Promise.resolve({
          idp: 'test-adapter',
          response: null,
        }),
    };

    // Test the getPersons method with a null response
    const mockParameters: SchulconnexQueryParameters = {};
    const result = await mockAdapter.getPersons(mockParameters);

    expect(result).toHaveProperty('idp', 'test-adapter');
    expect(result.response).toBeNull();
  });
});
