/**
 * @group integration/graphql
 */
import request from 'supertest';
import { DataSource } from 'typeorm';

import { AuthModule } from '../../common/auth';
import { IntrospectionClient } from '../../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../../common/auth/introspection/introspection-client.test';
import { GraphQLModule } from '../../common/graphql/graphql.module';
import { type TestingInfrastructure, createTestingInfrastructure } from '../../test/testing-module';
import { ClearanceModule } from '../clearance.module';
import { Clearance } from '../entity/clearance.entity';

const mockCreateQuery = {
  query: `
    mutation CreateClearance(
      $offerId: Int!
      $idmId: String!
      $groupId: String!
      $schoolId: String!
    ) {
      createClearance(
        offerId: $offerId
        idmId: $idmId
        groupId: $groupId
        schoolId: $schoolId
      ) {
        offerId
        idmId
        groupId
        schoolId
      }
    }
  `,
  operationName: 'CreateClearance',
  variables: {
    offerId: 54321,
    groupId: 'group-123',
    idmId: 'idm-5',
    schoolId: 'school-3',
  },
};

describe('ClearanceCreateMutation', () => {
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
      .send(mockCreateQuery)
      .expect((res) => {
        expect((res.body as { errors: { message: string }[] }).errors[0].message).toBe(
          'Forbidden resource',
        );
      });
  });

  it('creates clearance', async () => {
    // Attempt to create a clearance entry multiple times
    const response1 = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send(mockCreateQuery);
    const result1 = response1.body as {
      data: { createClearance: object };
    };
    expect(result1.data.createClearance).toEqual({
      offerId: 54321,
      groupId: 'group-123',
      schoolId: 'school-3',
      idmId: 'idm-5',
    });

    // Create a second entry (duplicate), which should not raise an error
    const response2 = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send(mockCreateQuery);
    const result2 = response2.body as {
      data: { createClearance: object };
    };
    expect(result2.data.createClearance).toEqual({
      offerId: 54321,
      groupId: 'group-123',
      schoolId: 'school-3',
      idmId: 'idm-5',
    });

    const dataSource = infra.module.get(DataSource);

    // Check if the clearance entry actually exists in the database
    const clearanceFromDb = await dataSource.manager.findOne(Clearance, {
      where: {
        offerId: 54321,
        groupId: 'group-123',
        idmId: 'idm-5',
        schoolId: 'school-3',
      },
    });
    expect(clearanceFromDb).toBeDefined();
    expect(clearanceFromDb?.offerId).toBe(54321);
    expect(clearanceFromDb?.groupId).toBe('group-123');
    expect(clearanceFromDb?.idmId).toBe('idm-5');
    expect(clearanceFromDb?.schoolId).toBe('school-3');

    // Make sure that only one entry exists in the database
    const clearancesFromDb = await dataSource.manager.findBy(Clearance, {
      offerId: 54321,
      groupId: 'group-123',
      idmId: 'idm-5',
      schoolId: 'school-3',
    });
    expect(clearancesFromDb).toBeDefined();
    expect(clearancesFromDb).toHaveLength(1);
  });

  it('complains on missing fields', async () => {
    await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation CreateClearance(
            $offerId: Int!
            $idmId: String!
            $schoolId: String!
          ) {
            createClearance(
              offerId: $offerId
              idmId: $idmId
              schoolId: $schoolId
            ) {
              offerId
              idmId
              groupId
              schoolId
            }
          }
        `,
        operationName: 'CreateClearance',
        variables: {
          offerId: 12345,
          idmId: 'idm-5',
          schoolId: 'school-3',
        },
      })
      .expect((res) => {
        expect(res.badRequest).toBe(true);
        expect(res.statusCode).toBe(400);
      });
  });
});
