/**
 * @group integration/graphql
 */
import request from 'supertest';

import { AuthModule } from '../../common/auth';
import { TestIntrospectionClient } from '../../common/auth/introspection/introspection-client.test';
import { GraphQLModule } from '../../common/graphql/graphql.module';
import { IntrospectionClient } from '../../common/auth/introspection/introspection-client';
import {
  type TestingInfrastructure,
  createTestingInfrastructure,
} from '../../test/testing-module';
import { OffersModule } from '../offers.module';
import { OffersService } from '../offers.service';
import { OffersDto } from '../dto/offers.dto';

const mockOffersService = {
  getOffers: async (schoolId: string[]): Promise<OffersDto[]> => {
    void schoolId;

    const offerDto = new OffersDto();
    offerDto.offerId = 12345678;

    return Promise.resolve([offerDto]);
  },
};

describe('OffersQuery', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;

  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    infra = await createTestingInfrastructure({
      imports: [GraphQLModule, OffersModule, AuthModule],
    })
      .configureModule((module) => {
        module
          .overrideProvider(IntrospectionClient)
          .useValue(testIntrospectionClient)
          .overrideProvider(OffersService)
          .useValue(mockOffersService);
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
          allOffers {
            offerId
          }
        }`,
      })
      .expect((res) => {
        expect(
          (res.body as { errors: { message: string }[] }).errors[0].message,
        ).toBe('Forbidden resource');
      });
  });

  it('fetches offers', async () => {
    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send({
        query: `query {
          allOffers {
            offerId
          }
        }`,
      });
    const result = response.body as {
      data: { allOffers: object[] };
    };

    expect(result.data.allOffers).toHaveLength(1);
    expect(result.data.allOffers[0]).toEqual({
      offerId: 12345678,
    });
  });
});
