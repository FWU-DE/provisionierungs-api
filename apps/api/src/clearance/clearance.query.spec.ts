/**
 * @group integration/graphql
 */
import request from 'supertest';

import { AuthModule } from '../auth/auth.module';
import { TestIntrospectionClient } from '../auth/introspection/introspection-client.test';
import { GraphQLModule } from '../graphql/graphql.module';
import { ClearanceModule } from './clearance.module';
import { IntrospectionClient } from '../auth/introspection/introspection-client';
import {
  type TestingInfrastructure,
  createTestingInfrastructure,
} from '../test/testing-module';
import { fixture } from '../test/fixture/fixture.interface';
import { Clearance } from './clearance.entity';

describe('ClearanceQuery', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;

  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    infra = await createTestingInfrastructure({
      imports: [GraphQLModule, ClearanceModule, AuthModule],
    })
      .configureModule((module) => {
        module
          .overrideProvider(IntrospectionClient)
          .useValue(testIntrospectionClient);
      })
      .enableDatabase()
      .build();

    testIntrospectionClient.addUserToken('::user-access-token::', ['openid']);
    await infra.setUp();
  });

  afterEach(async () => {
    await infra.tearDown();
  });

  it('requires authentication', async () => {
    await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .send({
        query: `query {
          allClearances {
            id
          }
        }`,
      })
      .expect((res) => {
        expect(
          (res.body as { errors: { message: string }[] }).errors[0].message,
        ).toBe('Forbidden resource');
      });
  });

  it('fetches clearances', async () => {
    await infra.addFixtures(
      fixture(Clearance, {
        appId: 'app-1',
        schoolId: 'school-1',
        idpId: 'idp-1',
        groupId: 'group-1',
      }),
    );
    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send({
        query: `query {
          allClearances {
            id
            appId
            schoolId
            idpId
          }
        }`,
      });
    const result = response.body as {
      data: { allClearances: object[] };
    };
    expect(result.data.allClearances).toHaveLength(1);
    expect(result.data.allClearances[0]).toEqual({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: expect.any(String),
      appId: 'app-1',
      schoolId: 'school-1',
      idpId: 'idp-1',
    });
  });
});
