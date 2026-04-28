/**
 * @group integration/graphql
 */
import request from 'supertest';
import { DataSource } from 'typeorm';

import { ClearanceModule } from '../../clearance/clearance.module';
import { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import { AuthModule } from '../../common/auth';
import { IntrospectionClient } from '../../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../../common/auth/introspection/introspection-client.test';
import { GraphQLModule } from '../../common/graphql/graphql.module';
import { Aggregator } from '../../identity-management/aggregator/aggregator';
import { OffersService } from '../../offers/offers.service';
import { OfferValidationService } from '../../offers/service/offer-validation.service';
import { type TestingInfrastructure, createTestingInfrastructure } from '../../test/testing-module';
import { RosteringGraphqlModule } from '../graphql.module';

const mockCreateQuery = {
  query: `
    mutation CreateGroupClearance(
      $offerId: Int!
      $idmId: String!
      $groupId: String!
      $schoolId: String!
    ) {
      createGroupClearance(
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
  operationName: 'CreateGroupClearance',
  variables: {
    offerId: 54321,
    groupId: 'group-123',
    idmId: 'idm-5',
    schoolId: 'school-3',
  },
};

describe('GroupClearanceCreateMutation', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;
  const mockOffersService = {
    getOffers: jest.fn(),
  };
  const mockOfferValidationService = {
    validateSchoolsAreActiveForOffer: jest
      .fn()
      .mockImplementation((schoolIds: string[]) => schoolIds),
  };

  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    infra = await createTestingInfrastructure({
      imports: [GraphQLModule, RosteringGraphqlModule, ClearanceModule, AuthModule],
    })
      .configureModule((module) => {
        module.overrideProvider(IntrospectionClient).useValue(testIntrospectionClient);
        module.overrideProvider(OffersService).useValue(mockOffersService);
        module.overrideProvider(OfferValidationService).useValue(mockOfferValidationService);
      })
      .enableDatabase()
      .build();

    mockOffersService.getOffers.mockResolvedValue([{ offerId: 54321 }]);

    testIntrospectionClient.addUserToken(
      '::user-access-token::',
      ['openid'],
      undefined,
      undefined,
      undefined,
      {
        heimatorganisation: 'idm-5',
        schulkennung: ['school-3'],
      },
    );
    infra.module.get(Aggregator).getGroups = jest.fn().mockResolvedValue([
      {
        idm: 'idm-5',
        groups: [{ id: 'group-123' }],
      },
    ]);
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
      data: { createGroupClearance: object };
    };

    expect(result1.data.createGroupClearance).toEqual({
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
      data: { createGroupClearance: object };
    };

    expect(result2.data.createGroupClearance).toEqual({
      offerId: 54321,
      groupId: 'group-123',
      schoolId: 'school-3',
      idmId: 'idm-5',
    });

    const dataSource = infra.module.get(DataSource);

    // Check if the clearance entry actually exists in the database
    const clearanceFromDb = await dataSource.manager.findOne(GroupClearance, {
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
    const clearancesFromDb = await dataSource.manager.findBy(GroupClearance, {
      offerId: 54321,
      groupId: 'group-123',
      idmId: 'idm-5',
      schoolId: 'school-3',
    });
    expect(clearancesFromDb).toBeDefined();
    expect(clearancesFromDb).toHaveLength(1);
  });
  it('denies clearance creation if idmId does not match', async () => {
    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send({
        ...mockCreateQuery,
        variables: {
          ...mockCreateQuery.variables,
          idmId: 'idm-wrong',
        },
      });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.errors[0].message).toBe('Forbidden');
  });

  it('denies clearance creation if schoolId does not match', async () => {
    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send({
        ...mockCreateQuery,
        variables: {
          ...mockCreateQuery.variables,
          schoolId: 'school-wrong',
        },
      });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.errors[0].message).toBe('Forbidden');
  });

  it('denies clearance creation if offerId is not in active offers', async () => {
    mockOffersService.getOffers.mockResolvedValue([{ offerId: 99999 }]);

    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send(mockCreateQuery);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.errors[0].message).toBe('Forbidden');
  });

  it('complains on missing fields', async () => {
    await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation CreateGroupClearance(
            $offerId: Int!
            $idmId: String!
            $schoolId: String!
          ) {
            createGroupClearance(
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
        operationName: 'CreateGroupClearance',
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
