import { type SchulconnexOrganization } from '../../identity-management/dto/schulconnex/schulconnex-organization.dto';
import { type SchulconnexPersonsResponseDto } from '../../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { type GroupClearance } from '../entity/group-clearance.entity';
import { applyClearancePersonsGroupFilter } from './clearance-group.filter';

describe('clearance-group.filter', () => {
  describe('applyClearancePersonsGroupFilter', () => {
    it('should return an empty array if groupClearanceEntries is undefined', () => {
      const identities: SchulconnexPersonsResponseDto[] = [{ pid: '1', personenkontexte: [] }];
      const result = applyClearancePersonsGroupFilter(identities, undefined);
      expect(result).toEqual([]);
    });

    it('should return an empty array if no identities match the cleared group IDs', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: '1',
          personenkontexte: [
            {
              id: 'ctx1',
              organisation: { kennung: 'school-1' } as SchulconnexOrganization,
              gruppen: [
                {
                  gruppe: { id: 'group-1' },
                },
              ],
            },
          ],
        },
      ];
      const groupClearanceEntries: GroupClearance[] = [
        { groupId: 'group-2', schoolId: 'school-1' } as GroupClearance,
      ];

      const result = applyClearancePersonsGroupFilter(identities, groupClearanceEntries);
      expect(result).toHaveLength(0);
    });

    it('should return matching identities', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'match',
          personenkontexte: [
            {
              id: 'ctx1',
              organisation: { kennung: 'school-match' } as SchulconnexOrganization,
              gruppen: [
                {
                  gruppe: { id: 'group-match' },
                },
              ],
            },
          ],
        },
        {
          pid: 'no-match',
          personenkontexte: [
            {
              id: 'ctx2',
              organisation: { kennung: 'school-match' } as SchulconnexOrganization,
              gruppen: [
                {
                  gruppe: { id: 'group-other' },
                },
              ],
            },
          ],
        },
      ];
      const groupClearanceEntries: GroupClearance[] = [
        { groupId: 'group-match', schoolId: 'school-match' } as GroupClearance,
      ];

      const result = applyClearancePersonsGroupFilter(identities, groupClearanceEntries);
      expect(result).toHaveLength(1);
      expect(result[0].pid).toBe('match');
    });

    it('should handle missing personenkontexte or gruppen', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'no-context',
          personenkontexte: null,
        },
        {
          pid: 'no-groups',
          personenkontexte: [
            {
              id: 'ctx1',
              organisation: { kennung: 'school-1' } as SchulconnexOrganization,
              gruppen: null,
            },
          ],
        },
      ];
      const groupClearanceEntries: GroupClearance[] = [
        { groupId: 'any-group', schoolId: 'school-1' } as GroupClearance,
      ];

      const result = applyClearancePersonsGroupFilter(identities, groupClearanceEntries);
      expect(result).toHaveLength(0);
    });

    it('should match if any group in any context matches', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'complex-match',
          personenkontexte: [
            {
              id: 'ctx1',
              organisation: { kennung: 'school-1' } as SchulconnexOrganization,
              gruppen: [{ gruppe: { id: 'no-match-1' } }, { gruppe: { id: 'match-me' } }],
            },
            {
              id: 'ctx2',
              organisation: { kennung: 'school-2' } as SchulconnexOrganization,
              gruppen: [{ gruppe: { id: 'no-match-2' } }],
            },
          ],
        },
      ];
      const groupClearanceEntries: GroupClearance[] = [
        { groupId: 'match-me', schoolId: 'school-1' } as GroupClearance,
      ];

      const result = applyClearancePersonsGroupFilter(identities, groupClearanceEntries);
      expect(result).toHaveLength(1);
      expect(result[0].pid).toBe('complex-match');
    });

    it('should ignore groupClearanceEntries without groupId', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: '1',
          personenkontexte: [
            {
              id: 'ctx1',
              gruppen: [{ gruppe: { id: 'group-1' } }],
            },
          ],
        },
      ];
      const groupClearanceEntries: GroupClearance[] = [
        {} as GroupClearance, // groupId is undefined
      ];

      const result = applyClearancePersonsGroupFilter(identities, groupClearanceEntries);
      expect(result).toHaveLength(0);
    });

    it('should NOT match if the groupId matches but the schoolId does not', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'wrong-school',
          personenkontexte: [
            {
              id: 'ctx1',
              organisation: {
                id: 'school-2',
                kennung: 'school-2-kennung',
              } as SchulconnexOrganization,
              gruppen: [
                {
                  gruppe: { id: 'group-1' },
                },
              ],
            },
          ],
        },
      ];
      const groupClearanceEntries: GroupClearance[] = [
        { groupId: 'group-1', schoolId: 'school-1-kennung' } as GroupClearance,
      ];

      const result = applyClearancePersonsGroupFilter(identities, groupClearanceEntries);
      expect(result).toHaveLength(0);
    });

    it('should match if both groupId and schoolId match', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'match',
          personenkontexte: [
            {
              id: 'ctx1',
              organisation: {
                id: 'school-1',
                kennung: 'school-1-kennung',
              } as SchulconnexOrganization,
              gruppen: [
                {
                  gruppe: { id: 'group-1' },
                },
              ],
            },
          ],
        },
      ];
      const groupClearanceEntries: GroupClearance[] = [
        { groupId: 'group-1', schoolId: 'school-1-kennung' } as GroupClearance,
      ];

      const result = applyClearancePersonsGroupFilter(identities, groupClearanceEntries);
      expect(result).toHaveLength(1);
      expect(result[0].pid).toBe('match');
    });
  });
});
