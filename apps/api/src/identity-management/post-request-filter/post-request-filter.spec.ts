import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PostRequestFilter } from './post-request-filter';
import type { SchulconnexPersonsResponse } from '../dto/schulconnex/schulconnex-persons-response.dto';
import { SchulconnexQueryParameters } from '../../controller/parameters/schulconnex-query-parameters';
import type { SchulconnexPerson } from '../dto/schulconnex/schulconnex-person.dto';
import type { SchulconnexPersonContext } from '../dto/schulconnex/schulconnex-person-context.dto';
import type { SchulconnexOrganization } from '../dto/schulconnex/schulconnex-organization.dto';
import type { SchulconnexGroupdataset } from '../dto/schulconnex/schulconnex-groupdataset.dto';
import type { SchulconnexName } from '../dto/schulconnex/schulconnex-name.dto';
import type { SchulconnexGroup } from '../dto/schulconnex/schulconnex-group.dto';

describe('PostRequestFilter', () => {
  let filter: PostRequestFilter;
  let mockPersonsData: SchulconnexPersonsResponse[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostRequestFilter],
    }).compile();

    filter = module.get<PostRequestFilter>(PostRequestFilter);

    // Create mock data for testing
    mockPersonsData = [
      {
        pid: 'person-1',
        person: {
          name: {
            familienname: 'Doe',
            vorname: 'John',
          } as SchulconnexName,
          stammorganisation: {
            id: 'org-1',
            name: 'School 1',
          } as SchulconnexOrganization,
        } as SchulconnexPerson,
        personenkontexte: [
          {
            id: 'context-1',
            rolle: 'LEHR',
            organisation: {
              id: 'org-1',
              name: 'School 1',
            } as SchulconnexOrganization,
            gruppen: [
              {
                gruppe: {
                  id: 'group-1',
                  bezeichnung: 'Class 1',
                } as SchulconnexGroup,
              } as SchulconnexGroupdataset,
            ],
            loeschung: null,
          } as SchulconnexPersonContext,
        ],
      } as SchulconnexPersonsResponse,
      {
        pid: 'person-2',
        person: {
          name: {
            familienname: 'Smith',
            vorname: 'Jane',
          } as SchulconnexName,
          stammorganisation: {
            id: 'org-2',
            name: 'School 2',
          } as SchulconnexOrganization,
        } as SchulconnexPerson,
        personenkontexte: [
          {
            id: 'context-2',
            rolle: 'LERN',
            organisation: {
              id: 'org-2',
              name: 'School 2',
            } as SchulconnexOrganization,
            gruppen: [
              {
                gruppe: {
                  id: 'group-2',
                  bezeichnung: 'Class 2',
                } as SchulconnexGroup,
              } as SchulconnexGroupdataset,
            ],
            loeschung: null,
          } as SchulconnexPersonContext,
        ],
      } as SchulconnexPersonsResponse,
      // Add a person with no person data and no context data for edge case testing
      {
        pid: 'person-3',
        personenkontexte: [],
      } as SchulconnexPersonsResponse,
    ];
  });

  describe('filterByQueryParameters', () => {
    it('should return all entries with the bare minimum of data when no filters are applied', () => {
      const parameters = new SchulconnexQueryParameters();
      const result = filter.filterByQueryParameters(
        mockPersonsData,
        parameters,
      );
      expect(result).toHaveLength(3);
      expect(result[0].pid).toBe('person-1');
      expect(result[1].pid).toBe('person-2');
      expect(result[2].pid).toBe('person-3');
    });

    it('should filter by pid', () => {
      const parameters = new SchulconnexQueryParameters(undefined, 'person-1');
      const result = filter.filterByQueryParameters(
        mockPersonsData,
        parameters,
      );
      expect(result).toHaveLength(1);
      expect(result[0].pid).toBe('person-1');
    });

    it('should filter by personenkontext.id', () => {
      const parameters = new SchulconnexQueryParameters(
        undefined,
        undefined,
        'context-2',
      );
      const result = filter.filterByQueryParameters(
        mockPersonsData,
        parameters,
      );
      expect(result).toHaveLength(1);
      expect(result[0].pid).toBe('person-2');
    });

    it('should filter by gruppe.id', () => {
      const parameters = new SchulconnexQueryParameters(
        undefined,
        undefined,
        undefined,
        'group-1',
      );
      const result = filter.filterByQueryParameters(
        mockPersonsData,
        parameters,
      );
      expect(result).toHaveLength(1);
      expect(result[0].pid).toBe('person-1');
    });

    it('should filter by organisation.id', () => {
      const parameters = new SchulconnexQueryParameters(
        undefined,
        undefined,
        undefined,
        undefined,
        'org-2',
      );
      const result = filter.filterByQueryParameters(
        mockPersonsData,
        parameters,
      );
      expect(result).toHaveLength(1);
      expect(result[0].pid).toBe('person-2');
    });

    it('should filter for completion with personen', () => {
      const parameters = new SchulconnexQueryParameters('personen');
      const result = filter.filterByQueryParameters(
        mockPersonsData,
        parameters,
      );

      // Should include person data but not organization details
      expect(result).toHaveLength(3);
      expect(result[0].person).toBeDefined();
      expect(result[0].person?.name).toBeDefined();
      expect(result[0].person?.stammorganisation).toBeUndefined();
      expect(result[0].personenkontexte?.[0].id).toBeDefined();
      expect(result[0].personenkontexte?.[0].rolle).toBeUndefined();
    });

    it('should filter for completion with personenkontexte', () => {
      const parameters = new SchulconnexQueryParameters('personenkontexte');
      const result = filter.filterByQueryParameters(
        mockPersonsData,
        parameters,
      );

      // Should include person context data
      expect(result).toHaveLength(3);
      expect(result[0].person).toBeUndefined();
      expect(result[0].personenkontexte?.[0].id).toBeDefined();
      expect(result[0].personenkontexte?.[0].rolle).toBeDefined();
      expect(result[0].personenkontexte?.[0].organisation?.id).toBeDefined();
      expect(
        result[0].personenkontexte?.[0].organisation?.name,
      ).toBeUndefined();
    });

    it('should filter for completion with organisationen', () => {
      const parameters = new SchulconnexQueryParameters('organisationen');
      const result = filter.filterByQueryParameters(
        mockPersonsData,
        parameters,
      );

      // Should include organization data
      expect(result).toHaveLength(3);
      expect(result[0].person).toBeUndefined();
      expect(result[0].personenkontexte?.[0].id).toBeDefined();
      // Since personenkontexte is not requested, organisation should not be present
      expect(result[0].personenkontexte?.[0].organisation).toBeUndefined();
    });

    it('should filter for completion with gruppen', () => {
      const parameters = new SchulconnexQueryParameters('gruppen');
      const result = filter.filterByQueryParameters(
        mockPersonsData,
        parameters,
      );

      // Should include group data
      expect(result).toHaveLength(3);
      expect(result[0].person).toBeUndefined();
      expect(result[0].personenkontexte?.[0].id).toBeDefined();
      // Since personenkontexte is not requested, gruppen should not be present
      expect(result[0].personenkontexte?.[0].gruppen).toBeUndefined();
    });

    it('should filter for completion with multiple values', () => {
      const parameters = new SchulconnexQueryParameters(
        'personen,organisationen,gruppen,personenkontexte',
      );
      const result = filter.filterByQueryParameters(
        mockPersonsData,
        parameters,
      );

      // Should include person, organization, and group data
      expect(result).toHaveLength(3);
      expect(result[0].person).toBeDefined();
      expect(result[0].person?.stammorganisation).toBeDefined();
      expect(result[0].personenkontexte?.[0].id).toBeDefined();
      expect(result[0].personenkontexte?.[0].organisation?.id).toBeDefined();
      expect(result[0].personenkontexte?.[0].organisation?.name).toBeDefined();
      expect(
        result[0].personenkontexte?.[0].gruppen?.[0].gruppe?.id,
      ).toBeDefined();
      expect(
        result[0].personenkontexte?.[0].gruppen?.[0].gruppe?.bezeichnung,
      ).toBeDefined();
    });

    it('should apply multiple filters together', () => {
      const parameters = new SchulconnexQueryParameters(
        'personen',
        undefined,
        undefined,
        'group-1',
      );
      const result = filter.filterByQueryParameters(
        mockPersonsData,
        parameters,
      );

      // Should filter by group-1 and include person data
      expect(result).toHaveLength(1);
      expect(result[0].pid).toBe('person-1');
      expect(result[0].person).toBeDefined();
      expect(result[0].person?.name).toBeDefined();
    });

    it('should handle persons with no person data and empty context data', () => {
      const parameters = new SchulconnexQueryParameters(
        'personen,personenkontexte',
      );
      const result = filter.filterByQueryParameters(
        mockPersonsData,
        parameters,
      );

      // Should include all persons, including the one with no data
      expect(result).toHaveLength(3);

      // Check the person with no data
      const personWithNoData = result.find((p) => p.pid === 'person-3');
      expect(personWithNoData).toBeDefined();
      expect(personWithNoData?.person).toBeUndefined();
      expect(personWithNoData?.personenkontexte).toEqual([]);
    });
  });
});
