import request from 'supertest';

import { GroupClearanceService } from '../clearance/group-clearance.service';
import { SchoolClearanceService } from '../clearance/school-clearance.service';
import { AuthModule } from '../common/auth';
import { IntrospectionClient } from '../common/auth/introspection/introspection-client';
import { TestIntrospectionClient } from '../common/auth/introspection/introspection-client.test';
import { ScopeIdentifier } from '../common/auth/scope/scope-identifier';
import { Aggregator } from '../identity-management/aggregator/aggregator';
import { OffersFetcher } from '../offers/fetcher/offers.fetcher';
import { type TestingInfrastructure, createTestingInfrastructure } from '../test/testing-module';
import { ControllerModule } from './controller.module';

describe('Schulconnex Users Controller', () => {
  let infra: TestingInfrastructure;
  let testIntrospectionClient: TestIntrospectionClient;
  let aggregator: Aggregator;
  let offersFetcher: OffersFetcher;
  let groupClearanceService: GroupClearanceService;
  let schoolClearanceService: SchoolClearanceService;

  beforeEach(async () => {
    testIntrospectionClient = new TestIntrospectionClient();
    infra = await createTestingInfrastructure({
      imports: [ControllerModule, AuthModule],
    })
      .configureModule((module) => {
        module.overrideProvider(IntrospectionClient).useValue(testIntrospectionClient);
        module.overrideProvider(Aggregator).useValue({
          getPersons: jest.fn().mockResolvedValue([]),
        });
        module.overrideProvider(OffersFetcher).useValue({
          fetchOfferForClientId: jest.fn(),
        });
        module.overrideProvider(GroupClearanceService).useValue({
          findAllForOffer: jest.fn().mockResolvedValue([]),
        });
        module.overrideProvider(SchoolClearanceService).useValue({
          findAllForOffer: jest.fn().mockResolvedValue([]),
        });
      })
      .build();

    aggregator = infra.module.get(Aggregator);
    offersFetcher = infra.module.get(OffersFetcher);
    groupClearanceService = infra.module.get(GroupClearanceService);
    schoolClearanceService = infra.module.get(SchoolClearanceService);

    testIntrospectionClient.addClientToken('::access-token-with-scope::', [
      ScopeIdentifier.SCHULCONNEX_ACCESS,
    ]);
    testIntrospectionClient.addClientToken('::access-token-without-scope::', []);
    testIntrospectionClient.addUserToken('::user-access-token::', ['idm_api']);

    await infra.setUp();
  });

  afterEach(async () => {
    await infra.tearDown();
  });

  describe('Access Control', () => {
    it('no authorization', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/personen-info')
        .expect(403);
    });

    it('missing scope', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/personen-info')
        .set('Authorization', 'Bearer ::access-token-without-scope::')
        .expect(403);
    });

    it('missing token', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/personen-info')
        .set('Authorization', 'Bearer ::missing-access-token::')
        .expect(403);
    });

    it('wrong resource owner', async () => {
      await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/personen-info')
        .set('Authorization', 'Bearer ::user-access-token::')
        .expect(403);
    });
  });

  describe('Data Retrieval', () => {
    it('returns empty list when no offer is found for client', async () => {
      (offersFetcher.fetchOfferForClientId as jest.Mock).mockResolvedValue(null);

      const response = await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/personen-info')
        .set('Authorization', 'Bearer ::access-token-with-scope::')
        .expect(200);

      expect(response.body).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(offersFetcher.fetchOfferForClientId).toHaveBeenCalled();
    });

    it('returns empty list when no clearance is found for offer', async () => {
      (offersFetcher.fetchOfferForClientId as jest.Mock).mockResolvedValue({ offerId: 123 });
      (groupClearanceService.findAllForOffer as jest.Mock).mockResolvedValue([]);
      (schoolClearanceService.findAllForOffer as jest.Mock).mockResolvedValue([]);

      const response = await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/personen-info')
        .set('Authorization', 'Bearer ::access-token-with-scope::')
        .expect(200);

      expect(response.body).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(aggregator.getPersons).not.toHaveBeenCalled();
    });

    it('aggregates idmIds and calls aggregator with correct parameters', async () => {
      const clientId = 'specific-client-id';
      testIntrospectionClient.addClientToken(
        '::specific-client-token::',
        [ScopeIdentifier.SCHULCONNEX_ACCESS],
        clientId,
      );

      const offerId = 1944628; // Currently hardcoded in controller!
      (offersFetcher.fetchOfferForClientId as jest.Mock).mockResolvedValue({ offerId });
      (groupClearanceService.findAllForOffer as jest.Mock).mockResolvedValue([{ idmId: 'idm-1' }]);
      (schoolClearanceService.findAllForOffer as jest.Mock).mockResolvedValue([{ idmId: 'idm-2' }]);
      (aggregator.getPersons as jest.Mock).mockResolvedValue([{ id: 'person-1' }]);

      const response = await request((await infra.getApp()).getHttpServer())
        .get('/schulconnex/v1/personen-info')
        .query({
          'pid': 'some-pid',
          'gruppe.id': 'some-group-id',
          'organisation.id': 'some-org-id',
          'personenkontext.id': 'some-context-id',
          'vollstaendig': 'personen,gruppen',
        })
        .set('Authorization', 'Bearer ::specific-client-token::')
        .expect(200);

      expect(response.body).toEqual([{ id: 'person-1' }]);
      expect(response.header).toHaveProperty('etag');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(offersFetcher.fetchOfferForClientId).toHaveBeenCalledWith(clientId);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(aggregator.getPersons).toHaveBeenCalledWith(
        expect.arrayContaining(['idm-1', 'idm-2']),
        expect.objectContaining({ offerId, clientId }),
        expect.objectContaining({
          'pid': 'some-pid',
          'gruppe.id': 'some-group-id',
          'organisation.id': 'some-org-id',
          'personenkontext.id': 'some-context-id',
          'vollstaendig': new Set(['personen', 'gruppen']),
        }),
        expect.arrayContaining([{ idmId: 'idm-1' }]),
        expect.arrayContaining([{ idmId: 'idm-2' }]),
      );
    });
  });
});
