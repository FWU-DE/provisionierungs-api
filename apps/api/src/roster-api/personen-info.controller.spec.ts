import request from 'supertest';
import { Test, type TestingModule } from '@nestjs/testing';
import { RosterApiModule } from './roster-api.module';
import type { INestApplication } from '@nestjs/common';
import type { SchulconnexPersonResponse } from './dto/schulconnex-person-response.dto';
import type { Application } from 'express';

describe('Schulconnex Users Controller', () => {
  let infra: TestingModule;
  let app: INestApplication<Application>;
  beforeEach(async () => {
    infra = await Test.createTestingModule({
      imports: [RosterApiModule],
    }).compile();

    app = infra.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await infra.close();
  });

  it('smoke test', async () => {
    const response = await request(app.getHttpServer())
      .get('/schulconnex/v1/personen-info')
      .set('Authorization', 'Bearer ::access-token-with-scope::')
      .expect(200);

    expect(response.body).toHaveLength(1);
    const person1 = (response.body as SchulconnexPersonResponse[])[0];

    expect(person1.person).toBeUndefined();
    expect(person1).toEqual({
      pid: 'pseudonym-400f5163-336c-4882-8897-c66da1fba5cf',
      personenkontexte: [
        {
          id: 'pseudonym-e5e70949-e6f9-4a23-9839-9de361db0b32',
          loeschung: null,
        },
      ],
    });
  });
});
