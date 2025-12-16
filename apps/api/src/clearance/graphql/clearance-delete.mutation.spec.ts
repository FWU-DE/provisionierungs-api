/**
 * @group integration/graphql
 */
import request from 'supertest';
import { DataSource } from 'typeorm';

import { AuthModule } from '../../common/auth';
import { IntrospectionClient } from '../../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../../common/auth/introspection/introspection-client.test';
import { GraphQLModule } from '../../common/graphql/graphql.module';
import { fixture } from '../../test/fixture/fixture.interface';
import { type TestingInfrastructure, createTestingInfrastructure } from '../../test/testing-module';
import { ClearanceModule } from '../clearance.module';
import { Clearance } from '../entity/clearance.entity';

const mockDeleteQuery = {
  query: `
    mutation DeleteClearance(
      $id: String!
    ) {
      deleteClearance(
        id: $id
      ) {
        deleted
      }
    }
  `,
  variables: {
    id: 'deb74e35-ea5f-535f-890f-5779b5d8e27f',
  },
};

describe('ClearanceDeleteMutation', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;

  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    infra = await createTestingInfrastructure({
      imports: [GraphQLModule, ClearanceModule, AuthModule],
    })
      .configureModule((module) => {
        module.overrideProvider(IntrospectionClient).useValue(testIntrospectionClient);
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
      .send(mockDeleteQuery)
      .expect((res) => {
        expect((res.body as { errors: { message: string }[] }).errors[0].message).toBe(
          'Forbidden resource',
        );
      });
  });

  it('deletes clearance', async () => {
    const mockClearance = fixture(Clearance, {
      id: 'deb74e35-ea5f-535f-890f-5779b5d8e27f',
      offerId: 34567,
      schoolId: 'school-1',
      idmId: 'idm-1',
      groupId: 'group-1',
    });
    await infra.addFixtures(mockClearance);

    const dataSource = infra.module.get(DataSource);

    // Check if the clearance entry actually exists in the database
    const fixtureFromDb = await dataSource.manager.findOne(Clearance, {
      where: {
        id: 'deb74e35-ea5f-535f-890f-5779b5d8e27f',
      },
    });
    expect(fixtureFromDb).toBeDefined();
    expect(fixtureFromDb?.offerId).toBe(34567);
    expect(fixtureFromDb?.groupId).toBe('group-1');
    expect(fixtureFromDb?.idmId).toBe('idm-1');
    expect(fixtureFromDb?.schoolId).toBe('school-1');

    // Attempt to delete a clearance entry multiple times
    const response1 = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send(mockDeleteQuery);
    const result1 = response1.body as {
      data: { deleteClearance: object };
    };
    expect(result1.data.deleteClearance).toEqual({
      deleted: true,
    });

    // Delete the entry a second time), which should not raise an error
    const response2 = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send(mockDeleteQuery);
    const result2 = response2.body as {
      data: { deleteClearance: object };
    };
    expect(result2.data.deleteClearance).toEqual({
      deleted: true,
    });

    // Check if the clearance entry actually exists in the database
    const clearanceFromDb = await dataSource.manager.findOne(Clearance, {
      where: {
        id: 'deb74e35-ea5f-535f-890f-5779b5d8e27f',
      },
    });
    expect(clearanceFromDb).toBeDefined();
    expect(clearanceFromDb?.offerId).toBeUndefined();
  });
});
