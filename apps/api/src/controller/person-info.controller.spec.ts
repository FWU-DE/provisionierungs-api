import request from 'supertest';

import { AuthModule } from '../common/auth';
import { IntrospectionClient } from '../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../common/auth/introspection/introspection-client.test';
import { ScopeIdentifier } from '../common/auth/scope/scope-identifier';
import { type TestingInfrastructure, createTestingInfrastructure } from '../test/testing-module';
import { ControllerModule } from './controller.module';
import { PersonInfoService } from './service/person-info.service';

describe('Schulconnex Person-Info Controller', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;
  let personInfoService: PersonInfoService;

  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    infra = await createTestingInfrastructure({
      imports: [ControllerModule, AuthModule],
    })
      .configureModule((module) => {
        module
          .overrideProvider(IntrospectionClient)
          .useValue(testIntrospectionClient)
          .overrideProvider(PersonInfoService)
          .useValue({
            fetchPersons: jest.fn(),
          });
      })
      .build();

    personInfoService = infra.module.get(PersonInfoService);

    testIntrospectionClient.addUserToken(
      '::access-token-with-scope::',
      [ScopeIdentifier.SCHULCONNEX_ACCESS],
      'test-user-id',
      'test-client-id',
    );
    testIntrospectionClient.addUserToken('::access-token-without-scope::', []);
    testIntrospectionClient.addClientToken('::client-access-token::', ['idm_api']);

    await infra.setUp();
  });

  afterEach(async () => {
    await infra.tearDown();
  });

  describe('Access Control', () => {
    it('no authorization', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/person-info')
        .expect(403);
    });

    it('missing scope', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/person-info')
        .set('Authorization', 'Bearer ::access-token-without-scope::')
        .expect(403);
    });

    it('missing token', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/person-info')
        .set('Authorization', 'Bearer ::missing-access-token::')
        .expect(403);
    });

    it('wrong resource owner', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/person-info')
        .set('Authorization', 'Bearer ::client-access-token::')
        .expect(403);
    });
  });

  it('smoke test: returns person info for authenticated user', async () => {
    const person = { pid: 'test-person-id', person: {} };
    (personInfoService.fetchPersons as jest.Mock).mockResolvedValue([person]);

    const response = await request((await infra.getApp()).getHttpServer())
      .get('/schulconnex/v1/person-info')
      .set('Authorization', 'Bearer ::access-token-with-scope::')
      .expect(200);

    expect(response.body).toEqual(person);
    expect(response.header).toHaveProperty('etag');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(personInfoService.fetchPersons).toHaveBeenCalledWith(
      'test-client-id',
      expect.objectContaining({
        pid: 'test-user-id',
      }),
    );
  });

  it('returns 404 if person info not found', async () => {
    (personInfoService.fetchPersons as jest.Mock).mockResolvedValue([]);

    await request((await infra.getApp()).getHttpServer())
      .get('/schulconnex/v1/person-info')
      .set('Authorization', 'Bearer ::access-token-with-scope::')
      .expect(404);
  });
});
