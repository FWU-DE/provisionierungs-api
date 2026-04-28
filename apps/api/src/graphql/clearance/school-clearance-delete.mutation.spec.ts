/**
 * @group integration/graphql
 */
import request from 'supertest';
import { DataSource } from 'typeorm';

import { ClearanceModule } from '../../clearance/clearance.module';
import { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { AuthModule } from '../../common/auth';
import { IntrospectionClient } from '../../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../../common/auth/introspection/introspection-client.test';
import { GraphQLModule } from '../../common/graphql/graphql.module';
import { fixture } from '../../test/fixture/fixture.interface';
import { type TestingInfrastructure, createTestingInfrastructure } from '../../test/testing-module';
import { RosteringGraphqlModule } from '../graphql.module';

const mockDeleteQuery = {
  query: `
    mutation DeleteSchoolClearance(
      $id: String!
    ) {
      deleteSchoolClearance(
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

describe('SchoolClearanceDeleteMutation', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;

  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    infra = await createTestingInfrastructure({
      imports: [GraphQLModule, RosteringGraphqlModule, ClearanceModule, AuthModule],
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

  it('deletes school clearance', async () => {
    const mockSchoolClearance = fixture(SchoolClearance, {
      id: 'deb74e35-ea5f-535f-890f-5779b5d8e27f',
      offerId: 34567,
      idmId: 'idm-1',
      schoolId: 'school-1',
      schoolOrgId: 'org-1',
    });
    await infra.addFixtures(mockSchoolClearance);

    const dataSource = infra.module.get(DataSource);

    // Check if the clearance entry actually exists in the database
    const fixtureFromDb = await dataSource.manager.findOne(SchoolClearance, {
      where: {
        id: 'deb74e35-ea5f-535f-890f-5779b5d8e27f',
      },
    });
    expect(fixtureFromDb).toBeDefined();
    expect(fixtureFromDb?.offerId).toBe(34567);
    expect(fixtureFromDb?.idmId).toBe('idm-1');
    expect(fixtureFromDb?.schoolId).toBe('school-1');

    // Attempt to delete a clearance entry multiple times
    const response1 = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send(mockDeleteQuery);
    const result1 = response1.body as {
      data: { deleteSchoolClearance: { deleted: boolean } };
    };
    expect(result1.data.deleteSchoolClearance).toEqual({
      deleted: true,
    });

    // Delete the entry a second time, which should not raise an error
    const response2 = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send(mockDeleteQuery);
    const result2 = response2.body as {
      data: { deleteSchoolClearance: { deleted: boolean } };
    };
    expect(result2.data.deleteSchoolClearance).toEqual({
      deleted: true,
    });

    // Check if the clearance entry actually exists in the database
    const clearanceFromDb = await dataSource.manager.findOne(SchoolClearance, {
      where: {
        id: 'deb74e35-ea5f-535f-890f-5779b5d8e27f',
      },
    });
    expect(clearanceFromDb).toBeDefined();
    expect(clearanceFromDb?.offerId).toBeUndefined();
  });

  it('denies deletion if idmId does not match', async () => {
    const mockSchoolClearance = fixture(SchoolClearance, {
      id: 'deb74e35-ea5f-535f-890f-5779b5d8e27f',
      offerId: 34567,
      idmId: 'idm-wrong',
      schoolId: 'school-1',
      schoolOrgId: 'org-1',
    });
    await infra.addFixtures(mockSchoolClearance);

    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send(mockDeleteQuery);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.errors[0].message).toBe('Forbidden');
  });

  it('denies deletion if schoolId does not match', async () => {
    const mockSchoolClearance = fixture(SchoolClearance, {
      id: 'deb74e35-ea5f-535f-890f-5779b5d8e27f',
      offerId: 34567,
      idmId: 'idm-1',
      schoolId: 'school-wrong',
      schoolOrgId: 'org-1',
    });
    await infra.addFixtures(mockSchoolClearance);

    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send(mockDeleteQuery);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.errors[0].message).toBe('Forbidden');
  });
});
