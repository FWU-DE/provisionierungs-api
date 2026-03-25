/**
 * @group integration/graphql
 */
import request from 'supertest';

import { AuthModule } from '../../common/auth';
import { IntrospectionClient } from '../../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../../common/auth/introspection/introspection-client.test';
import { GraphQLModule } from '../../common/graphql/graphql.module';
import { OffersDto } from '../../offers/dto/offers.dto';
import { OffersModule } from '../../offers/offers.module';
import { OffersService } from '../../offers/offers.service';
import { type TestingInfrastructure, createTestingInfrastructure } from '../../test/testing-module';
import { RosteringGraphqlModule } from '../graphql.module';

const mockOffersService = {
  getOffers: async (schoolId: string[]): Promise<OffersDto[]> => {
    void schoolId;

    const offerDto = new OffersDto();
    offerDto.offerId = 12345678;
    offerDto.offerTitle = 'Test Offer';
    offerDto.offerLongTitle = 'Test Offer Long Title';
    offerDto.offerDescription = 'Test Offer Description';
    offerDto.offerLink = 'https://example.com';
    offerDto.offerLogo =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    offerDto.educationProviderOrganizationName = 'Test Org';

    return Promise.resolve([offerDto]);
  },
  getOfferById: async (schoolId: string[], id: number): Promise<OffersDto> => {
    void schoolId;

    const offerDto = new OffersDto();
    offerDto.offerId = id;
    offerDto.offerTitle = 'Test Offer';
    offerDto.offerLongTitle = 'Test Offer Long Title';
    offerDto.offerDescription = 'Test Offer Description';
    offerDto.offerLink = 'https://example.com';
    offerDto.offerLogo =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    offerDto.educationProviderOrganizationName = 'Test Org';

    return Promise.resolve(offerDto);
  },
};

describe('OffersQuery', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;

  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    infra = await createTestingInfrastructure({
      imports: [GraphQLModule, RosteringGraphqlModule, OffersModule, AuthModule],
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
        expect((res.body as { errors: { message: string }[] }).errors[0].message).toBe(
          'Forbidden resource',
        );
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

  it('fetches a single offer', async () => {
    const response = await request((await infra.getApp()).getHttpServer())
      .post('/graphql')
      .set('Authorization', 'Bearer ::user-access-token::')
      .send({
        query: `query {
          offer(id: 12345678) {
            offerId
          }
        }`,
      });
    const result = response.body as {
      data: { offer: object };
    };

    expect(result.data.offer).toEqual({
      offerId: 12345678,
    });
  });
});
