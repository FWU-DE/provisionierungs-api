import request from 'supertest';
import { AuthModule } from '../common/auth';
import {
  createTestingInfrastructure,
  type TestingInfrastructure,
} from '../test/testing-module';
import { ControllerModule } from './controller.module';
import { IntrospectionClient } from '../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../common/auth/introspection/introspection-client.test';
import { ScopeIdentifier } from '../common/auth/scope/scope-identifier';

describe('Schulconnex Users Controller', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;
  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    infra = await createTestingInfrastructure({
      imports: [ControllerModule, AuthModule],
    })
      .configureModule((module) => {
        module
          .overrideProvider(IntrospectionClient)
          .useValue(testIntrospectionClient);
      })
      .build();

    testIntrospectionClient.addClientToken('::access-token-with-scope::', [
      ScopeIdentifier.SCHULCONNEX_ACCESS,
    ]);
    testIntrospectionClient.addClientToken(
      '::access-token-without-scope::',
      [],
    );
    testIntrospectionClient.addUserToken('::user-access-token::', ['idm_api']);

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

  it('smoke test', async () => {
    const response = await request((await infra.getApp()).getHttpServer())
      .get('/schulconnex/v1/personen-info')
      .set('Authorization', 'Bearer ::access-token-with-scope::')
      .expect(200);

    expect(response.body).toHaveLength(0);
  });
});
