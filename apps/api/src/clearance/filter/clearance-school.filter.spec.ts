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
              organisation: { kennung: 'school-A' } as SchulconnexOrganization,
            },
          ],
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolId: 'school-B' } as SchoolClearance,
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
              organisation: { kennung: 'school-A' } as SchulconnexOrganization,
            },
          ],
        } as SchulconnexPersonsResponseDto,
        {
          pid: 'user-no-match',
          personenkontexte: [
            {
              organisation: { kennung: 'school-B' } as SchulconnexOrganization,
            },
          ],
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolId: 'school-A' } as SchoolClearance,
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
              organisation: { kennung: 'school-B' } as SchulconnexOrganization,
            },
            {
              organisation: { kennung: 'school-A' } as SchulconnexOrganization,
            },
          ],
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolId: 'school-A' } as SchoolClearance,
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

    it('should handle contexts with missing organization or missing kennung', () => {
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
          pid: 'user-no-kennung',
          personenkontexte: [
            {
              organisation: { kennung: null } as SchulconnexOrganization,
            },
          ],
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolId: 'school-A' } as SchoolClearance,
      ];
      const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
      expect(result).toEqual([]);
    });

    it('should return no results if schoolClearance schoolId is null and identity organization kennung is null', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-null-kennung',
          personenkontexte: [
            {
              organisation: { kennung: null } as unknown as SchulconnexOrganization,
            },
          ],
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolId: null } as unknown as SchoolClearance,
      ];
      const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
      expect(result).toEqual([]);
    });

    it('should extract school IDs correctly and match multiple cleared schools', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-1',
          personenkontexte: [{ organisation: { kennung: 'school-A' } as SchulconnexOrganization }],
        } as SchulconnexPersonsResponseDto,
        {
          pid: 'user-2',
          personenkontexte: [{ organisation: { kennung: 'school-B' } as SchulconnexOrganization }],
        } as SchulconnexPersonsResponseDto,
        {
          pid: 'user-3',
          personenkontexte: [{ organisation: { kennung: 'school-C' } as SchulconnexOrganization }],
        } as SchulconnexPersonsResponseDto,
      ];
      const schoolClearanceEntries: SchoolClearance[] = [
        { schoolId: 'school-A' } as SchoolClearance,
        { schoolId: 'school-C' } as SchoolClearance,
      ];
      const result = applyClearancePersonsSchoolFilter(identities, schoolClearanceEntries);
      expect(result).toHaveLength(2);
      const pids = result.map((r) => r.pid);
      expect(pids).toContain('user-1');
      expect(pids).toContain('user-3');
      expect(pids).not.toContain('user-2');
    });
  });
});
