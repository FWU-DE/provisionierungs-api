import request from 'supertest';

import { GroupClearance } from '../clearance/entity/group-clearance.entity';
import { AuthModule } from '../common/auth';
import { IntrospectionClient } from '../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../common/auth/introspection/introspection-client.test';
import { ScopeIdentifier } from '../common/auth/scope/scope-identifier';
import { Aggregator } from '../identity-management/aggregator/aggregator';
import type { SchulconnexPersonResponse } from '../identity-management/dto/schulconnex/schulconnex-person-response.dto';
import { OffersFetcher } from '../offers/fetcher/offers.fetcher';
import { fixture } from '../test/fixture/fixture.interface';
import { type TestingInfrastructure, createTestingInfrastructure } from '../test/testing-module';
import { ControllerModule } from './controller.module';

describe('Schulconnex Person-Info Controller', () => {
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
          .useValue(testIntrospectionClient)
          .overrideProvider(OffersFetcher)
          .useValue({
            fetchOfferForClientId: (clientId: string) => {
              if (clientId === 'test-client-id') {
                return Promise.resolve({ offerId: 1234 });
              }

              return Promise.resolve(null);
            },
          })
          .overrideProvider(Aggregator)
          .useValue({
            getPersons: () => {
              return Promise.resolve([
                { pid: 'test-person-id', person: {} } satisfies SchulconnexPersonResponse,
              ]);
            },
          });
      })
      .enableDatabase()
      .addFixtures([
        fixture(GroupClearance, {
          offerId: 1234,
          schoolId: 'test-school-id',
          groupId: 'test-group-id',
          idmId: 'test-idm',
        }),
      ])
      .build();

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

  it('smoke test', async () => {
    const response = await request((await infra.getApp()).getHttpServer())
      .get('/schulconnex/v1/person-info')
      .set('Authorization', 'Bearer ::access-token-with-scope::')
      .expect(200);

    expect(response.body).toEqual({ pid: 'test-person-id', person: {} });
  });
});
