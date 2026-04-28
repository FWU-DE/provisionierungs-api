/**
 * @group integration/graphql
 */
import request from 'supertest';

import { ClearanceModule } from '../../clearance/clearance.module';
import { GroupClearance } from '../../clearance/entity/group-clearance.entity';
import { AuthModule } from '../../common/auth';
import { IntrospectionClient } from '../../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../../common/auth/introspection/introspection-client.test';
import { GraphQLModule } from '../../common/graphql/graphql.module';
import { ValidationService } from '../../identity-management/service/validation.service';
import { OfferValidationService } from '../../offers/service/offer-validation.service';
import { fixture } from '../../test/fixture/fixture.interface';
import { type TestingInfrastructure, createTestingInfrastructure } from '../../test/testing-module';
import { RosteringGraphqlModule } from '../graphql.module';

describe('GroupClearanceAllQuery', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;
  let offerValidationService: jest.Mocked<OfferValidationService>;
  let validationService: jest.Mocked<ValidationService>;

  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    offerValidationService = {
      validateSchoolsAreActiveForOffer: jest
        .fn()
        .mockImplementation((schoolIds: string[]) => schoolIds),
    } as unknown as jest.Mocked<OfferValidationService>;

    validationService = {
      validateGroupsForSchools: jest.fn().mockImplementation((_s, groupIds: string[]) => groupIds),
    } as unknown as jest.Mocked<ValidationService>;

    infra = await createTestingInfrastructure({
      imports: [GraphQLModule, RosteringGraphqlModule, ClearanceModule, AuthModule],
    })
      .configureModule((module) => {
        module.overrideProvider(IntrospectionClient).useValue(testIntrospectionClient);
        module.overrideProvider(OfferValidationService).useValue(offerValidationService);
        module.overrideProvider(ValidationService).useValue(validationService);
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
          allGroupClearances {
            groupId
          }
        }`,
      })
      .expect((res) => {
        expect((res.body as { errors: { message: string }[] }).errors[0].message).toBe(
          'Forbidden resource',
        );
      });
  });

  it('fetches clearances', async () => {
    await infra.addFixtures(
      fixture(GroupClearance, {
        offerId: 67890,
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
          allGroupClearances {
            offerId
            schoolId
            idmId
          }
        }`,
      });
    const result = response.body as {
      data: { allGroupClearances: object[] };
    };

    expect(result.data.allGroupClearances).toHaveLength(1);
    expect(result.data.allGroupClearances[0]).toEqual({
      offerId: 67890,
      schoolId: 'school-1',
      idmId: 'idm-1',
    });
  });

  it('filters group clearances by offerId', async () => {
    await infra.addFixtures(
      fixture(GroupClearance, {
        offerId: 1,
        schoolId: 'school-1',
        idmId: 'idm-1',
        groupId: 'group-a',
      }),
      fixture(GroupClearance, {
        offerId: 2,
        schoolId: 'school-1',
        idmId: 'idm-1',
        groupId: 'group-b',
      }),
    );

    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send({
        query: `query($offerId: Int) {
        allGroupClearances(offerId: $offerId) {
          offerId
        }
      }`,
        variables: {
          offerId: 1,
        },
      });

    const result = response.body as {
      data: { allGroupClearances: { offerId: number }[] };
    };

    expect(result.data.allGroupClearances).toHaveLength(1);
    expect(result.data.allGroupClearances[0].offerId).toBe(1);
  });

  it('narrows results to provided schoolId', async () => {
    await infra.addFixtures(
      fixture(GroupClearance, {
        offerId: 111,
        schoolId: 'school-1',
        idmId: 'idm-1',
        groupId: 'group-s1',
      }),
      fixture(GroupClearance, {
        offerId: 111,
        schoolId: 'school-2',
        idmId: 'idm-1',
        groupId: 'group-s2',
      }),
    );

    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send({
        query: `query($schoolId: String) {
        allGroupClearances(schoolId: $schoolId) {
          schoolId
        }
      }`,
        variables: {
          schoolId: 'school-1',
        },
      });

    const result = response.body as {
      data: { allGroupClearances: { schoolId: string }[] };
    };

    expect(result.data.allGroupClearances).toHaveLength(1);
    expect(result.data.allGroupClearances[0].schoolId).toBe('school-1');
  });
});
