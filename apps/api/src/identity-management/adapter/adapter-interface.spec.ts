import type {
  AdapterGetGroupsReturnType,
  AdapterInterface,
} from './adapter-interface';
import { SchulconnexQueryParameters } from '../../controller/parameters/schulconnex-query-parameters';

describe('AdapterInterface', () => {
  it('should handle getPersons method correctly', async () => {
    // Create a mock implementation
    const mockAdapter: AdapterInterface = {
      getIdentifier: () => 'test-adapter',
      getPersons: () =>
        Promise.resolve({
          idm: 'test-adapter',
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
      getGroups: function (): Promise<AdapterGetGroupsReturnType> {
        throw new Error('Function not implemented.');
      },
    };

    // Test the getPersons method
    const mockParameters: SchulconnexQueryParameters =
      new SchulconnexQueryParameters();
    const result = await mockAdapter.getPersons(mockParameters);

    expect(result).toHaveProperty('idm', 'test-adapter');
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
          idm: 'test-adapter',
          response: null,
        }),
      getGroups: function (): Promise<AdapterGetGroupsReturnType> {
        throw new Error('Function not implemented.');
      },
    };

    // Test the getPersons method with a null response
    const mockParameters: SchulconnexQueryParameters =
      new SchulconnexQueryParameters();
    const result = await mockAdapter.getPersons(mockParameters);

    expect(result).toHaveProperty('idm', 'test-adapter');
    expect(result.response).toBeNull();
  });
});
