import type { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import type { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { SchulconnexOrganizationQueryParameters } from '../../controller/parameters/schulconnex-organisations-query-parameters';
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
      getOrganizations: jest.fn(),
      getGroups: function (): Promise<AdapterGetGroupsReturnType> {
        throw new Error('Function not implemented.');
      },
    };

    // Test the getPersons method
    const mockParameters: SchulconnexPersonsQueryParameters =
      new SchulconnexPersonsQueryParameters();
    const result = await mockAdapter.getPersons(mockParameters, 'test-client-id');

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
      getOrganizations: jest.fn(),
      getGroups: function (): Promise<AdapterGetGroupsReturnType> {
        throw new Error('Function not implemented.');
      },
    };

    await mockAdapter.getPersons(mockParameters, 'idm-1', groupClearances, schoolClearances);

    expect(getPersonsMock).toHaveBeenCalledWith(
      mockParameters,
      'idm-1',
      groupClearances,
      schoolClearances,
    );
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
      getOrganizations: jest.fn(),
      getGroups: function (): Promise<AdapterGetGroupsReturnType> {
        throw new Error('Function not implemented.');
      },
    };

    // Test the getPersons method with a null response
    const mockParameters: SchulconnexPersonsQueryParameters =
      new SchulconnexPersonsQueryParameters();
    const result = await mockAdapter.getPersons(mockParameters, 'test-client-id');

    expect(result).toHaveProperty('idm', 'test-adapter');
    expect(result.response).toBeNull();
  });

  it('should handle getOrganizations method correctly', async () => {
    const mockAdapter: AdapterInterface = {
      getIdentifier: () => 'test-adapter',
      isEnabled: () => true,
      getPersons: jest.fn(),
      getOrganizations: () =>
        Promise.resolve({
          idm: 'test-adapter',
          response: [
            {
              id: 'test-org-id',
              name: 'Test School',
              typ: 'Schule',
            },
          ],
        }),
      getGroups: function (): Promise<AdapterGetGroupsReturnType> {
        throw new Error('Function not implemented.');
      },
    };

    const mockParameters: SchulconnexOrganizationQueryParameters =
      new SchulconnexOrganizationQueryParameters();
    const result = await mockAdapter.getOrganizations(mockParameters, 'test-client-id');

    expect(result).toHaveProperty('idm', 'test-adapter');
    expect(result).toHaveProperty('response');
    expect(Array.isArray(result.response)).toBe(true);
    expect(result.response?.[0]).toHaveProperty('id', 'test-org-id');
    expect(result.response?.[0]).toHaveProperty('name', 'Test School');
  });

  it('should allow null response in AdapterGetOrganizationsReturnType', async () => {
    const mockAdapter: AdapterInterface = {
      getIdentifier: () => 'test-adapter',
      isEnabled: () => true,
      getPersons: jest.fn(),
      getOrganizations: () =>
        Promise.resolve({
          idm: 'test-adapter',
          response: null,
        }),
      getGroups: function (): Promise<AdapterGetGroupsReturnType> {
        throw new Error('Function not implemented.');
      },
    };

    const mockParameters: SchulconnexOrganizationQueryParameters =
      new SchulconnexOrganizationQueryParameters();
    const result = await mockAdapter.getOrganizations(mockParameters, 'test-client-id');

    expect(result).toHaveProperty('idm', 'test-adapter');
    expect(result.response).toBeNull();
  });

  it('should handle getOrganizations method correctly', async () => {
    const mockAdapter: AdapterInterface = {
      getIdentifier: () => 'test-adapter',
      isEnabled: () => true,
      getPersons: jest.fn(),
      getOrganizations: () =>
        Promise.resolve({
          idm: 'test-adapter',
          response: [
            {
              id: 'test-org-id',
              name: 'Test School',
              typ: 'Schule',
            },
          ],
        }),
      getGroups: function (): Promise<AdapterGetGroupsReturnType> {
        throw new Error('Function not implemented.');
      },
    };

    const mockParameters: SchulconnexOrganizationQueryParameters =
      new SchulconnexOrganizationQueryParameters();
    const result = await mockAdapter.getOrganizations(mockParameters, 'client-1');

    expect(result).toHaveProperty('idm', 'test-adapter');
    expect(result).toHaveProperty('response');
    expect(Array.isArray(result.response)).toBe(true);
    expect(result.response?.[0]).toHaveProperty('id', 'test-org-id');
    expect(result.response?.[0]).toHaveProperty('name', 'Test School');
  });

  it('should allow null response in AdapterGetOrganizationsReturnType', async () => {
    const mockAdapter: AdapterInterface = {
      getIdentifier: () => 'test-adapter',
      isEnabled: () => true,
      getPersons: jest.fn(),
      getOrganizations: () =>
        Promise.resolve({
          idm: 'test-adapter',
          response: null,
        }),
      getGroups: function (): Promise<AdapterGetGroupsReturnType> {
        throw new Error('Function not implemented.');
      },
    };

    const mockParameters: SchulconnexOrganizationQueryParameters =
      new SchulconnexOrganizationQueryParameters();
    const result = await mockAdapter.getOrganizations(mockParameters, 'client-1');

    expect(result).toHaveProperty('idm', 'test-adapter');
    expect(result.response).toBeNull();
  });
});
