import type { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import type { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { SchulconnexPersonsQueryParameters } from '../../controller/parameters/schulconnex-persons-query-parameters';
import type { AdapterGetGroupsReturnType, AdapterInterface } from './adapter-interface';

describe('AdapterInterface', () => {
  it('should handle getPersons method correctly', async () => {
    // Create a mock implementation
    const mockAdapter: AdapterInterface = {
      getIdentifier: () => 'test-adapter',
      isEnabled: () => true,
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
      // @todo: Test the getOrganisations method
      getOrganizations: jest.fn(),
      getGroups: function (): Promise<AdapterGetGroupsReturnType> {
        throw new Error('Function not implemented.');
      },
    };

    // Test the getPersons method
    const mockParameters: SchulconnexPersonsQueryParameters =
      new SchulconnexPersonsQueryParameters();
    const result = await mockAdapter.getPersons(mockParameters);

    expect(result).toHaveProperty('idm', 'test-adapter');
    expect(result).toHaveProperty('response');
    expect(Array.isArray(result.response)).toBe(true);
    expect(result.response?.[0]).toHaveProperty('pid', 'test-pid');
  });

  it('should pass optional groupClearance and schoolClearance parameters to getPersons', async () => {
    const mockParameters: SchulconnexPersonsQueryParameters =
      new SchulconnexPersonsQueryParameters();

    const groupClearances: GroupClearance[] = [
      {
        offerId: 1,
        idmId: 'idm-1',
        schoolId: 'S-1',
        groupId: 'G-1',
        id: 'gc1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as GroupClearance,
    ];
    const schoolClearances: SchoolClearance[] = [
      {
        offerId: 2,
        idmId: 'idm-2',
        schoolId: 'S-2',
        schoolOrgId: 'SO-2',
        id: 'sc1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as SchoolClearance,
    ];

    const getPersonsMock = jest.fn().mockResolvedValue({ idm: 'test-adapter', response: null });

    const mockAdapter: AdapterInterface = {
      getIdentifier: () => 'test-adapter',
      isEnabled: () => true,
      getPersons: getPersonsMock,
      // @todo: Test the getOrganisations method
      getOrganizations: jest.fn(),
      getGroups: function (): Promise<AdapterGetGroupsReturnType> {
        throw new Error('Function not implemented.');
      },
    };

    await mockAdapter.getPersons(mockParameters, groupClearances, schoolClearances);

    expect(getPersonsMock).toHaveBeenCalledWith(mockParameters, groupClearances, schoolClearances);
  });

  it('should allow null response in AdapterGetPersonsReturnType', async () => {
    // Create a mock implementation that returns a null response
    const mockAdapter: AdapterInterface = {
      getIdentifier: () => 'test-adapter',
      isEnabled: () => true,
      getPersons: () =>
        Promise.resolve({
          idm: 'test-adapter',
          response: null,
        }),
      // @todo: Test the getOrganisations method
      getOrganizations: jest.fn(),
      getGroups: function (): Promise<AdapterGetGroupsReturnType> {
        throw new Error('Function not implemented.');
      },
    };

    // Test the getPersons method with a null response
    const mockParameters: SchulconnexPersonsQueryParameters =
      new SchulconnexPersonsQueryParameters();
    const result = await mockAdapter.getPersons(mockParameters);

    expect(result).toHaveProperty('idm', 'test-adapter');
    expect(result.response).toBeNull();
  });
});
