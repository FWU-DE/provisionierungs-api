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
import { SchoolClearance } from '../entity/school-clearance.entity';

const mockCreateQuery = {
  query: `
    mutation CreateSchoolClearance(
      $offerId: Int!
      $idmId: String!
      $schoolId: String!
    ) {
      createSchoolClearance(
        offerId: $offerId
        idmId: $idmId
        schoolId: $schoolId
      ) {
        offerId
        idmId
        schoolId
      }
    }
  `,
  operationName: 'CreateSchoolClearance',
  variables: {
    offerId: 54321,
    idmId: 'idm-5',
    schoolId: 'school-3',
  },
};

describe('SchoolClearanceCreateMutation', () => {
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
      data: { createSchoolClearance: object };
    };
    expect(result1.data.createSchoolClearance).toEqual({
      offerId: 54321,
      schoolId: 'school-3',
      idmId: 'idm-5',
    });

    // Create a second entry (duplicate), which should not raise an error
    const response2 = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send(mockCreateQuery);
    const result2 = response2.body as {
      data: { createSchoolClearance: object };
    };
    expect(result2.data.createSchoolClearance).toEqual({
      offerId: 54321,
      schoolId: 'school-3',
      idmId: 'idm-5',
    });

    const dataSource = infra.module.get(DataSource);

    // Check if the clearance entry actually exists in the database
    const clearanceFromDb = await dataSource.manager.findOne(SchoolClearance, {
      where: {
        offerId: 54321,
        idmId: 'idm-5',
        schoolId: 'school-3',
      },
    });
    expect(clearanceFromDb).toBeDefined();
    expect(clearanceFromDb?.offerId).toBe(54321);
    expect(clearanceFromDb?.idmId).toBe('idm-5');
    expect(clearanceFromDb?.schoolId).toBe('school-3');

    // Make sure that only one entry exists in the database
    const clearancesFromDb = await dataSource.manager.findBy(SchoolClearance, {
      offerId: 54321,
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
          mutation CreateSchoolClearance(
            $offerId: Int!
            $idmId: String!
          ) {
            createSchoolClearance(
              offerId: $offerId
              idmId: $idmId
            ) {
              offerId
              idmId
              schoolId
            }
          }
        `,
        operationName: 'CreateSchoolClearance',
        variables: {
          offerId: 12345,
          idmId: 'idm-5',
        },
      })
      .expect((res) => {
        expect(res.badRequest).toBe(true);
        expect(res.statusCode).toBe(400);
      });
  });
});
