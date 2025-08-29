import type { SchulconnexPersonContext } from '../roster-api/dto/schulconnex-person-context.dto';
import type { SchulconnexPerson } from '../roster-api/dto/schulconnex-person.dto';

export interface IdentityResult {
  pid: string;
  person: SchulconnexPerson;
  personenkontexte: SchulconnexPersonContext[];
}

export class IdentityProvider {
  // eslint-disable-next-line @typescript-eslint/require-await
  async getPersonByPseudonymForApp(
    appId: string,
    pid: string,
  ): Promise<IdentityResult | null> {
    void appId;
    return this.getTestData(pid);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getPersonsWithGroupmembershipsForApp(
    appId: string,
    groupId: string,
  ): Promise<IdentityResult[]> {
    void appId;
    void groupId;
    return [this.getTestData('pseudonym-400f5163-336c-4882-8897-c66da1fba5cf')];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getPersonsAndGroupsForApp(
    appId: string,
    schoolIds: string[],
  ): Promise<IdentityResult[]> {
    void appId;
    void schoolIds;
    return [this.getTestData('pseudonym-400f5163-336c-4882-8897-c66da1fba5cf')];
  }

  // TODO: Remove
  private getTestData(pid: string): IdentityResult {
    return {
      pid,
      person: {
        name: { vorname: 'Max', familienname: 'Mustermann' },
        stammorganisation: {
          id: 'org-1',
          kennung: 'NI-12345',
          name: 'Muster Schule',
          anschrift: {
            ort: 'Musterstadt',
            postleitzahl: '12345',
          },
          typ: 'SCHULE',
        },
      },
      personenkontexte: [
        {
          id: 'pseudonym-e5e70949-e6f9-4a23-9839-9de361db0b32',
          rolle: 'LEHR',
          loeschung: null,
          erreichbarkeiten: [
            { typ: 'E-Mail', kennung: 'marty.mcfly@eduplaces.local' },
          ],
          organisation: {
            id: 'org-1',
            kennung: 'NI-12345',
            name: 'Muster Schule',
            anschrift: {
              ort: 'Musterstadt',
              postleitzahl: '12345',
            },
            typ: 'SCHULE',
          },
          gruppen: [
            {
              gruppe: {
                id: 'pseudonym-e8345375-1a25-4833-8b62-f5db9a0bbd71',
                bezeichnung: 'Klasse 10a',
                typ: 'Klasse',
                orgid: 'org-1',
              },
            },
          ],
        },
      ],
    };
  }
}
