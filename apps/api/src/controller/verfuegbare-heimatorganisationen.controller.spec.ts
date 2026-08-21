import request from 'supertest';

import { AuthModule } from '../common/auth';
import { IntrospectionClient } from '../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../common/auth/introspection/introspection-client.test';
import { ScopeIdentifier } from '../common/auth/scope/scope-identifier';
import { Aggregator } from '../identity-management/aggregator/aggregator';
import { type TestingInfrastructure, createTestingInfrastructure } from '../test/testing-module';
import { ControllerModule } from './controller.module';

describe('Verfuegbare Heimatorganisationen Controller', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;
  let aggregator: Aggregator & { getAvailableAdapterIdentifiers: jest.Mock };

  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    infra = await createTestingInfrastructure({
      imports: [ControllerModule, AuthModule],
    })
      .configureModule((module) => {
        module.overrideProvider(IntrospectionClient).useValue(testIntrospectionClient);
        module.overrideProvider(Aggregator).useValue({
          getAvailableAdapterIdentifiers: jest.fn().mockReturnValue([]),
        });
      })
      .build();

    aggregator = infra.module.get(Aggregator);

    testIntrospectionClient.addClientToken('::access-token-with-scope::', [
      ScopeIdentifier.SCHULCONNEX_ACCESS,
    ]);
    testIntrospectionClient.addClientToken('::access-token-without-scope::', []);
    testIntrospectionClient.addUserToken('::user-access-token::', [
      ScopeIdentifier.SCHULCONNEX_ACCESS,
    ]);

    await infra.setUp();
  });

  afterEach(async () => {
    await infra.tearDown();
  });

  describe('Access Control', () => {
    it('no authorization', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/verfuegbare-heimatorganisationen')
        .expect(403);
    });

    it('missing scope', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/verfuegbare-heimatorganisationen')
        .set('Authorization', 'Bearer ::access-token-without-scope::')
        .expect(403);
    });

    it('missing token', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/verfuegbare-heimatorganisationen')
        .set('Authorization', 'Bearer ::missing-access-token::')
        .expect(403);
    });

    it('disallows user tokens', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/verfuegbare-heimatorganisationen')
        .set('Authorization', 'Bearer ::user-access-token::')
        .expect(403);
    });

    it('allows client tokens', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/verfuegbare-heimatorganisationen')
        .set('Authorization', 'Bearer ::access-token-with-scope::')
        .expect(200);
    });
  });

  describe('Data Retrieval', () => {
    it('returns the identifiers of all available adapters', async () => {
      aggregator.getAvailableAdapterIdentifiers.mockReturnValue(['eduplaces', 'saarland']);

      const response = await request((await infra.getApp()).getHttpServer())
        .get('/verfuegbare-heimatorganisationen')
        .set('Authorization', 'Bearer ::access-token-with-scope::')
        .expect(200);

      expect(response.body).toEqual(['eduplaces', 'saarland']);
    });
  });
});
