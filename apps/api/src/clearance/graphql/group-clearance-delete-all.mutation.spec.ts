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
import { GroupClearance } from '../entity/group-clearance.entity';

const mockDeleteAllQuery = {
  query: `
    mutation DeleteAllGroupClearance(
      $offerId: Int!,
      $idmId: String!,
      $schoolId: String!
    ) {
      deleteAllGroupClearances(
        offerId: $offerId,
        idmId: $idmId,
        schoolId: $schoolId
      ) {
        deleted
      }
    }
  `,
  variables: {
    offerId: 34567,
    idmId: 'idm-1',
    schoolId: 'school-1',
  },
};

describe('GroupClearanceDeleteAllMutation', () => {
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
      .send(mockDeleteAllQuery)
      .expect((res) => {
        expect((res.body as { errors: { message: string }[] }).errors[0].message).toBe(
          'Forbidden resource',
        );
      });
  });

  it('deletes all matching group clearances', async () => {
    const mockGroupClearance1 = fixture(GroupClearance, {
      id: 'deb74e35-ea5f-535f-890f-5779b5d8e27f',
      offerId: 34567,
      schoolId: 'school-1',
      idmId: 'idm-1',
      groupId: 'group-5',
    });
    const mockGroupClearance2 = fixture(GroupClearance, {
      id: 'eeb74e35-ea5f-535f-890f-5779b5d8e27f',
      offerId: 34567,
      schoolId: 'school-1',
      idmId: 'idm-1',
      groupId: 'group-6',
    });
    const mockGroupClearanceOther = fixture(GroupClearance, {
      id: 'feb74e35-ea5f-535f-890f-5779b5d8e27f',
      offerId: 34567,
      schoolId: 'school-2',
      idmId: 'idm-1',
      groupId: 'group-7',
    });
    await infra.addFixtures(mockGroupClearance1, mockGroupClearance2, mockGroupClearanceOther);

    const dataSource = infra.module.get(DataSource);

    // Check if the clearance entries actually exist in the database
    const countBefore = await dataSource.manager.count(GroupClearance, {
      where: {
        offerId: 34567,
        schoolId: 'school-1',
        idmId: 'idm-1',
      },
    });
    expect(countBefore).toBe(2);

    // Attempt to delete all matching clearance entries
    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send(mockDeleteAllQuery);

    const result = response.body as {
      data: { deleteAllGroupClearances: { deleted: boolean } };
    };

    expect(result.data.deleteAllGroupClearances).toEqual({
      deleted: true,
    });

    // Check if the matching clearance entries were deleted
    const countAfter = await dataSource.manager.count(GroupClearance, {
      where: {
        offerId: 34567,
        schoolId: 'school-1',
        idmId: 'idm-1',
      },
    });
    expect(countAfter).toBe(0);

    // Check if the other clearance entry still exists
    const otherEntry = await dataSource.manager.findOne(GroupClearance, {
      where: {
        id: 'feb74e35-ea5f-535f-890f-5779b5d8e27f',
      },
    });
    expect(otherEntry).toBeDefined();
    expect(otherEntry?.schoolId).toBe('school-2');
  });
});
