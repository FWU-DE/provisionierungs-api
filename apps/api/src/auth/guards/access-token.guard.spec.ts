import { Controller, Get, type Type } from '@nestjs/common';
import { createTestingInfrastructure } from '../../test/testing-module';
import { AuthModule } from '../auth.module';
import { IntrospectionClient } from '../introspection/introspection-client';
import { TestIntrospectionClient } from '../introspection/introspection-client.test';

import request from 'supertest';
import { AccessTokenAuthRequired } from '../route-decorators/access-token-auth-required.decorator';
import { NoAccessTokenAuthRequired } from '../route-decorators/no-access-token-auth-required.decorator';
describe('AccessTokenGuard', () => {
  it('restricts access without token per default', async () => {
    @Controller()
    class TestController {
      @Get('')
      get() {
        return 'ok';
      }
    }
    const { infra } = await createInfrastructureWithController([
      TestController,
    ]);
    const response = await request((await infra.getApp()).getHttpServer())
      .get('/')
      .expect(403);
    expect(response.body).toEqual({
      error: 'Forbidden',
      statusCode: 403,
      message: 'Forbidden resource',
    });
  });

  it('grants access with valid token', async () => {
    @Controller()
    class TestController {
      @Get('')
      get() {
        return 'ok';
      }
    }
    const { infra, testClient } = await createInfrastructureWithController([
      TestController,
    ]);
    testClient.addUserToken('valid-user-token', []);

    await request((await infra.getApp()).getHttpServer())
      .get('/')
      .set('Authorization', 'Bearer valid-user-token')
      .expect(200)
      .expect('ok');
  });

  it('accesses public route without token on class level', async () => {
    @Controller()
    @NoAccessTokenAuthRequired()
    class TestController {
      @Get('')
      get() {
        return 'ok';
      }
    }
    const { infra } = await createInfrastructureWithController([
      TestController,
    ]);

    await request((await infra.getApp()).getHttpServer())
      .get('/')
      .expect(200)
      .expect('ok');
  });

  it('accesses public route without token on method level', async () => {
    @Controller()
    class TestController {
      @Get('')
      @NoAccessTokenAuthRequired()
      get() {
        return 'ok';
      }
      @Get('/needs-auth')
      needsAuth() {
        return 'ok';
      }
    }
    const { infra } = await createInfrastructureWithController([
      TestController,
    ]);

    await request((await infra.getApp()).getHttpServer())
      .get('/')
      .expect(200)
      .expect('ok');
    await request((await infra.getApp()).getHttpServer())
      .get('/needs-auth')
      .expect(403);
  });

  it('method level overwrites class level', async () => {
    @Controller()
    @NoAccessTokenAuthRequired()
    class TestController {
      @Get('')
      get() {
        return 'ok';
      }

      @Get('/needs-auth')
      @AccessTokenAuthRequired()
      needsAuth() {
        return 'ok';
      }
    }
    const { infra } = await createInfrastructureWithController([
      TestController,
    ]);

    await request((await infra.getApp()).getHttpServer())
      .get('/')
      .expect(200)
      .expect('ok');
    await request((await infra.getApp()).getHttpServer())
      .get('/needs-auth')
      .expect(403);
  });
});

async function createInfrastructureWithController(controllers: Type<object>[]) {
  const testClient = new TestIntrospectionClient();
  const infra = await createTestingInfrastructure({
    imports: [AuthModule],
    controllers,
  })
    .configureModule((module) =>
      module.overrideProvider(IntrospectionClient).useValue(testClient),
    )
    .build();

  await infra.setUp();

  return { infra, testClient };
}
