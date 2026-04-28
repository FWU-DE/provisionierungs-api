import request from 'supertest';

import { AuthModule } from '../common/auth';
import { IntrospectionClient } from '../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../common/auth/introspection/introspection-client.test';
import { ScopeIdentifier } from '../common/auth/scope/scope-identifier';
import { type TestingInfrastructure, createTestingInfrastructure } from '../test/testing-module';
import { ControllerModule } from './controller.module';
import { PersonInfoService } from './service/person-info.service';

describe('Schulconnex Users Controller', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;
  let personInfoService: PersonInfoService;

  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    infra = await createTestingInfrastructure({
      imports: [ControllerModule, AuthModule],
    })
      .configureModule((module) => {
        module.overrideProvider(IntrospectionClient).useValue(testIntrospectionClient);
        module.overrideProvider(PersonInfoService).useValue({
          fetchPersons: jest.fn().mockResolvedValue([]),
        });
      })
      .build();

    personInfoService = infra.module.get(PersonInfoService);

    testIntrospectionClient.addClientToken('::access-token-with-scope::', [
      ScopeIdentifier.SCHULCONNEX_ACCESS,
    ]);
    testIntrospectionClient.addClientToken('::access-token-without-scope::', []);
    testIntrospectionClient.addUserToken('::user-access-token::', ['idm_api']);

    jest.clearAllMocks();

    await infra.setUp();
  });

  afterEach(async () => {
    await infra.tearDown();
  });

  describe('Access Control', () => {
    it('no authorization', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/personen-info')
        .expect(403);
    });

    it('missing scope', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/personen-info')
        .set('Authorization', 'Bearer ::access-token-without-scope::')
        .expect(403);
    });

    it('missing token', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/personen-info')
        .set('Authorization', 'Bearer ::missing-access-token::')
        .expect(403);
    });

    it('wrong resource owner', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/personen-info')
        .set('Authorization', 'Bearer ::user-access-token::')
        .expect(403);
    });
  });

  describe('Data Retrieval', () => {
    it('smoke test: calls personInfoService.fetchPersons and returns results', async () => {
      const clientId = 'specific-client-id';
      testIntrospectionClient.addClientToken(
        '::specific-client-token::',
        [ScopeIdentifier.SCHULCONNEX_ACCESS],
        clientId,
      );

      const persons = [{ id: 'person-1' }];
      (personInfoService.fetchPersons as jest.Mock).mockResolvedValue(persons);

      const response = await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/personen-info')
        .query({
          pid: 'some-pid',
          vollstaendig: 'personen,gruppen',
        })
        .set('Authorization', 'Bearer ::specific-client-token::')
        .expect(200);

      expect(response.body).toEqual(persons);
      expect(response.header).toHaveProperty('etag');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(personInfoService.fetchPersons).toHaveBeenCalledWith(
        clientId,
        expect.objectContaining({
          pid: 'some-pid',
          vollstaendig: new Set(['personen', 'gruppen']),
        }),
      );
    });
  });
});
