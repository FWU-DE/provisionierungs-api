import type { SchulconnexContactOptions } from '../../identity-management/dto/schulconnex/schulconnex-contact-options.dto';
import type { SchulconnexGroupdataset } from '../../identity-management/dto/schulconnex/schulconnex-groupdataset.dto';
import type { SchulconnexOrganization } from '../../identity-management/dto/schulconnex/schulconnex-organization.dto';
import type { SchulconnexPersonsResponseDto } from '../../identity-management/dto/schulconnex/schulconnex-persons-response.dto';
import { applyClearancePersonsFieldFilter } from './clearance-field.filter';

describe('clearance-field.filter', () => {
  describe('applyClearancePersonsFieldFilter', () => {
    it('should filter person data based on hardcoded defaults', () => {
      // Defaults: name: false, initials: true, role: true, groups: true, organization: true, email: true
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-1',
          person: {
            name: {
              vorname: 'Max',
              familienname: 'Mustermann',
              initialenvorname: 'M',
              initialenfamilienname: 'M',
            },
            stammorganisation: { kennung: 'school-1' } as SchulconnexOrganization,
          },
          personenkontexte: [
            {
              id: 'ctx-1',
              rolle: 'Lern',
              organisation: { kennung: 'school-1' } as SchulconnexOrganization,
              erreichbarkeiten: [
                { typ: 'E-Mail', kennung: 'max@example.com' },
              ] as SchulconnexContactOptions[],
              gruppen: [{ gruppe: { id: 'group-1' } }] as SchulconnexGroupdataset[],
            },
          ],
        },
      ];

      const result = applyClearancePersonsFieldFilter(1, identities);

      expect(result).toHaveLength(1);
      const filtered = result[0];
      expect(filtered.pid).toBe('user-1');

      // name: false, initials: true => name should only have initials
      expect(filtered.person?.name).toEqual({
        initialenvorname: 'M',
        initialenfamilienname: 'M',
      });
      // name.vorname and name.familienname should be gone (not in the returned object)
      expect(filtered.person?.name).not.toHaveProperty('vorname');
      expect(filtered.person?.name).not.toHaveProperty('familienname');

      // organization: true
      expect(filtered.person?.stammorganisation).toBeDefined();
      expect(filtered.person?.stammorganisation?.kennung).toBe('school-1');

      // context checks
      const ctx = filtered.personenkontexte?.[0];
      expect(ctx).toBeDefined();
      expect(ctx?.rolle).toBe('Lern'); // role: true
      expect(ctx?.organisation).toBeDefined(); // organization: true
      expect(ctx?.erreichbarkeiten).toBeDefined(); // email: true
      expect(ctx?.gruppen).toBeDefined(); // groups: true
    });

    it('should handle undefined person and context', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-empty',
          person: undefined,
          personenkontexte: null,
        },
      ];

      const result = applyClearancePersonsFieldFilter(1, identities);

      expect(result).toHaveLength(1);
      expect(result[0].person).toBeUndefined();
      expect(result[0].personenkontexte).toEqual([]);
    });

    it('should handle person without name by initializing initials', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-no-name',
          person: {
            stammorganisation: { kennung: 'school-1' } as SchulconnexOrganization,
          },
        },
      ];

      const result = applyClearancePersonsFieldFilter(1, identities);

      // The current implementation creates an empty name object with null initials
      // if initials are enabled (default: true) but name is disabled (default: false)
      expect(result[0].person?.name).toEqual({
        initialenfamilienname: null,
        initialenvorname: null,
      });
    });

    it('should filter multiple identities', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        { pid: '1', person: {} },
        { pid: '2', person: {} },
      ];
      const result = applyClearancePersonsFieldFilter(1, identities);
      expect(result).toHaveLength(2);
      expect(result[0].pid).toBe('1');
      expect(result[1].pid).toBe('2');
    });

    it('should correctly filter nested objects in context', () => {
      const identities: SchulconnexPersonsResponseDto[] = [
        {
          pid: 'user-1',
          personenkontexte: [
            {
              id: 'ctx-1',
              rolle: 'Lehr',
              organisation: { kennung: 'org-1' } as SchulconnexOrganization,
              erreichbarkeiten: [
                { typ: 'E-Mail', kennung: 'test@example.com' },
              ] as SchulconnexContactOptions[],
              gruppen: [{ gruppe: { id: 'group-1' } }] as SchulconnexGroupdataset[],
            },
          ],
        },
      ];

      const result = applyClearancePersonsFieldFilter(1, identities);
      const ctx = result[0].personenkontexte?.[0];

      // Defaults: role: true, groups: true, organization: true, email: true
      expect(ctx?.rolle).toBe('Lehr');
      expect(ctx?.organisation).toBeDefined();
      expect(ctx?.gruppen).toHaveLength(1);
      expect(ctx?.erreichbarkeiten).toHaveLength(1);
    });
  });
});
