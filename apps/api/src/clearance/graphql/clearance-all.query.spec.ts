/**
 * @group integration/graphql
 */
import request from 'supertest';

import { AuthModule } from '../../common/auth';
import { TestIntrospectionClient } from '../../common/auth/introspection/introspection-client.test';
import { GraphQLModule } from '../../common/graphql/graphql.module';
import { ClearanceModule } from '../clearance.module';
import { IntrospectionClient } from '../../common/auth/introspection/introspection-client';
import {
  type TestingInfrastructure,
  createTestingInfrastructure,
} from '../../test/testing-module';
import { fixture } from '../../test/fixture/fixture.interface';
import { Clearance } from '../entity/clearance.entity';

describe('ClearanceAllQuery', () => {
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

    testIntrospectionClient.addUserToken(
      '::user-access-token::',
      ['openid'],
      undefined,
      undefined,
      undefined,
      {
        heimatorganisation: 'idm-1',
        schulkennung: ['school-1'],
      },
    );
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
            groupId
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
        offerId: 34567,
        schoolId: 'school-1',
        idmId: 'idm-1',
        groupId: 'group-1' + String(Math.random()),
      }),
    );
    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send({
        query: `query {
          allClearances {
            offerId
            schoolId
            idmId
          }
        }`,
      });
    const result = response.body as {
      data: { allClearances: object[] };
    };

    expect(result.data.allClearances).toHaveLength(1);
    expect(result.data.allClearances[0]).toEqual({
      offerId: 34567,
      schoolId: 'school-1',
      idmId: 'idm-1',
    });
  });
});
