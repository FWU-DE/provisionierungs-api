/**
 * @group integration/graphql
 */
import request from 'supertest';

import { ClearanceModule } from '../../clearance/clearance.module';
import { SchoolClearance } from '../../clearance/entity/school-clearance.entity';
import { AuthModule } from '../../common/auth';
import { IntrospectionClient } from '../../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../../common/auth/introspection/introspection-client.test';
import { GraphQLModule } from '../../common/graphql/graphql.module';
import { OfferValidationService } from '../../offers/service/offer-validation.service';
import { fixture } from '../../test/fixture/fixture.interface';
import { type TestingInfrastructure, createTestingInfrastructure } from '../../test/testing-module';
import { RosteringGraphqlModule } from '../graphql.module';

describe('SchoolClearanceAllQuery', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;
  let offerValidationService: jest.Mocked<OfferValidationService>;

  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    offerValidationService = {
      validateSchoolsAreActiveForOffer: jest
        .fn()
        .mockImplementation((schoolIds: string[]) => schoolIds),
    } as unknown as jest.Mocked<OfferValidationService>;

    infra = await createTestingInfrastructure({
      imports: [GraphQLModule, RosteringGraphqlModule, ClearanceModule, AuthModule],
    })
      .configureModule((module) => {
        module.overrideProvider(IntrospectionClient).useValue(testIntrospectionClient);
        module.overrideProvider(OfferValidationService).useValue(offerValidationService);
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
          allSchoolClearances {
            schoolId
          }
        }`,
      })
      .expect((res) => {
        expect((res.body as { errors: { message: string }[] }).errors[0].message).toBe(
          'Forbidden resource',
        );
      });
  });

  it('fetches school clearances', async () => {
    await infra.addFixtures(
      fixture(SchoolClearance, {
        offerId: 67890,
        idmId: 'idm-1',
        schoolId: 'school-1',
        schoolOrgId: 'org-1',
      }),
    );
    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send({
        query: `query {
          allSchoolClearances {
            offerId
            idmId
            schoolId
          }
        }`,
      });
    const result = response.body as {
      data: { allSchoolClearances: object[] };
    };

    expect(result.data.allSchoolClearances).toHaveLength(1);
    expect(result.data.allSchoolClearances[0]).toEqual({
      offerId: 67890,
      idmId: 'idm-1',
      schoolId: 'school-1',
    });
  });

  it('filters school clearances by offerId', async () => {
    await infra.addFixtures(
      fixture(SchoolClearance, {
        offerId: 1,
        idmId: 'idm-1',
        schoolId: 'school-1',
        schoolOrgId: 'org-1',
      }),
      fixture(SchoolClearance, {
        offerId: 2,
        idmId: 'idm-1',
        schoolId: 'school-1',
        schoolOrgId: 'org-1',
      }),
    );
    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send({
        query: `query($offerId: Int) {
          allSchoolClearances(offerId: $offerId) {
            offerId
          }
        }`,
        variables: {
          offerId: 1,
        },
      });
    const result = response.body as {
      data: { allSchoolClearances: { offerId: number }[] };
    };

    expect(result.data.allSchoolClearances).toHaveLength(1);
    expect(result.data.allSchoolClearances[0].offerId).toBe(1);
  });
});
