import type { SchulconnexGroupdataset } from '../../identity-management/dto/schulconnex/schulconnex-groupdataset.dto';
import type { SchulconnexOrganization } from '../../identity-management/dto/schulconnex/schulconnex-organization.dto';
import { type SchulconnexPersonsResponseDto } from '../../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { type SchoolClearance } from '../entity/school-clearance.entity';
import { applyClearancePersonsSchoolFilter } from './clearance-school.filter';

describe('clearance-school.filter', () => {
  describe('applyClearancePersonsSchoolFilter', () => {
    it('should return empty array if schoolClearanceEntries is undefined', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        { pid: 'user-1' } as SchulconnexPersonsResponseDto,
      ];
      const result = applyClearancePersonsSchoolFilter(identities, undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array if no identities match the cleared school IDs', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-1',
          personenkontexte: [
            {
              organisation: { id: 'school-A' } as SchulconnexOrganization,
            },
          ],
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolOrgId: 'school-B' } as SchoolClearance,
      ];
      const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
      expect(result).toEqual([]);
    });

    it('should return identities that have at least one context with a matching school ID', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-match',
          personenkontexte: [
            {
              organisation: { id: 'school-A' } as SchulconnexOrganization,
            },
          ],
        } as SchulconnexPersonsResponseDto,
        {
          pid: 'user-no-match',
          personenkontexte: [
            {
              organisation: { id: 'school-B' } as SchulconnexOrganization,
            },
          ],
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolOrgId: 'school-A' } as SchoolClearance,
      ];
      const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
      expect(result).toHaveLength(1);
      expect(result[0].pid).toBe('user-match');
    });

    it('should return matching identity if it has multiple contexts and only one matches', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-match',
          personenkontexte: [
            {
              organisation: { id: 'school-B' } as SchulconnexOrganization,
            },
            {
              organisation: { id: 'school-A' } as SchulconnexOrganization,
            },
          ],
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolOrgId: 'school-A' } as SchoolClearance,
      ];
      const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
      expect(result).toHaveLength(1);
      expect(result[0].pid).toBe('user-match');
    });

    it('should handle identities with no contexts', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-no-ctx',
          personenkontexte: [],
        } as SchulconnexPersonsResponseDto,
        {
          pid: 'user-null-ctx',
          personenkontexte: null,
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolId: 'school-A' } as SchoolClearance,
      ];
      const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
      expect(result).toEqual([]);
    });
    it('should handle contexts with missing organization or missing ID', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-no-org',
          personenkontexte: [
            {
              organisation: null,
            },
          ],
        } as SchulconnexPersonsResponseDto,
        {
          pid: 'user-no-id',
          personenkontexte: [
            {
              organisation: { id: null } as unknown as SchulconnexOrganization,
            },
          ],
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolOrgId: 'school-A' } as SchoolClearance,
      ];
      const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
      expect(result).toEqual([]);
    });

    it('should return no results if schoolClearance schoolOrgId is null and identity organization ID is null', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-null-id',
          personenkontexte: [
            {
              organisation: { id: null } as unknown as SchulconnexOrganization,
            },
          ],
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolOrgId: null } as unknown as SchoolClearance,
      ];
      const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
      expect(result).toEqual([]);
    });

    it('should extract school IDs correctly and match multiple cleared schools', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-1',
          personenkontexte: [{ organisation: { id: 'school-A' } as SchulconnexOrganization }],
        } as SchulconnexPersonsResponseDto,
        {
          pid: 'user-2',
          personenkontexte: [{ organisation: { id: 'school-B' } as SchulconnexOrganization }],
        } as SchulconnexPersonsResponseDto,
        {
          pid: 'user-3',
          personenkontexte: [{ organisation: { id: 'school-C' } as SchulconnexOrganization }],
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolOrgId: 'school-A' } as SchoolClearance,
        { schoolOrgId: 'school-C' } as SchoolClearance,
      ];
      const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
      expect(result).toHaveLength(2);
      const pids = result.map((r) => r.pid);
      expect(pids).toContain('user-1');
      expect(pids).toContain('user-3');
      expect(pids).not.toContain('user-2');
    });

    describe('sub-entry filtration', () => {
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolOrgId: 'cleared-school' } as SchoolClearance,
      ];

      it('should match and keep stammorganisation if it matches', () => {
        const identities: SchulconnexPersonsResponseDto[] = [
          {
            pid: 'user-1',
            person: {
              stammorganisation: { id: 'cleared-school' } as SchulconnexOrganization,
            },
          } as SchulconnexPersonsResponseDto,
        ];
        const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
        expect(result).toHaveLength(1);
        expect(result[0].person?.stammorganisation?.id).toBe('cleared-school');
      });

      it('should clear stammorganisation if it does not match', () => {
        const identities: SchulconnexPersonsResponseDto[] = [
          {
            pid: 'user-1',
            person: {
              stammorganisation: { id: 'other-school' } as SchulconnexOrganization,
            },
            personenkontexte: [
              { organisation: { id: 'cleared-school' } as SchulconnexOrganization },
            ],
          } as SchulconnexPersonsResponseDto,
        ];
        const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
        expect(result).toHaveLength(1);
        expect(result[0].person?.stammorganisation).toBeUndefined();
      });

      it('should filter out non-matching personenkontexte', () => {
        const identities: SchulconnexPersonsResponseDto[] = [
          {
            pid: 'user-1',
            personenkontexte: [
              { organisation: { id: 'cleared-school' } as SchulconnexOrganization },
              { organisation: { id: 'other-school' } as SchulconnexOrganization },
            ],
          } as SchulconnexPersonsResponseDto,
        ];
        const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
        expect(result).toHaveLength(1);
        expect(result[0].personenkontexte).toHaveLength(1);
        expect(result[0].personenkontexte?.[0].organisation?.id).toBe('cleared-school');
      });

      it('should NOT keep identity if a group matches but no organization does', () => {
        const identities: SchulconnexPersonsResponseDto[] = [
          {
            pid: 'user-1',
            personenkontexte: [
              {
                organisation: { id: 'other-school' } as SchulconnexOrganization,
                gruppen: [
                  { gruppe: { orgid: 'cleared-school' } } as SchulconnexGroupdataset,
                  { gruppe: { orgid: 'other-school' } } as SchulconnexGroupdataset,
                ],
              },
            ],
          } as SchulconnexPersonsResponseDto,
        ];
        const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
        expect(result).toHaveLength(0);
      });

      it('should filter out non-matching groups within a matching organization context', () => {
        const identities: SchulconnexPersonsResponseDto[] = [
          {
            pid: 'user-1',
            personenkontexte: [
              {
                organisation: { id: 'cleared-school' } as SchulconnexOrganization,
                gruppen: [
                  { gruppe: { orgid: 'cleared-school' } } as SchulconnexGroupdataset,
                  { gruppe: { orgid: 'other-school' } } as SchulconnexGroupdataset,
                ],
              },
            ],
          } as SchulconnexPersonsResponseDto,
        ];
        const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
        expect(result).toHaveLength(1);
        expect(result[0].personenkontexte?.[0].gruppen).toHaveLength(1);
        expect(result[0].personenkontexte?.[0].gruppen?.[0].gruppe?.orgid).toBe('cleared-school');
      });
    });
  });
});
