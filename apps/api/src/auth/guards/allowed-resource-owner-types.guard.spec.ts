import { Controller, Get, type Type } from '@nestjs/common';
import { createTestingInfrastructure } from '../../test/testing-module';
import { AuthModule } from '../auth.module';
import { IntrospectionClient } from '../introspection/introspection-client';
import { TestIntrospectionClient } from '../introspection/introspection-client.test';

import request from 'supertest';
import { AllowResourceOwnerType } from '../route-decorators/allow-resource-owner-type.decorator';
import { ResourceOwnerType } from '../enums/resource-owner-type.enum';
describe('ResourceOwnerTokenGuard', () => {
  it('does not grant access with wrong grant type per default', async () => {
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
    testClient.addClientToken('valid-client-token', []);

    const response = await request((await infra.getApp()).getHttpServer())
      .get('/')
      .set('Authorization', 'Bearer valid-client-token')
      .expect(403);

    expect(response.body).toEqual({
      error: 'Forbidden',
      statusCode: 403,
      message: 'Forbidden resource',
    });
  });

  it('does not grant access with wrong grant type on class level', async () => {
    @Controller()
    @AllowResourceOwnerType(ResourceOwnerType.CLIENT)
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
    testClient.addClientToken('valid-client-token', []);

    await request((await infra.getApp()).getHttpServer())
      .get('/')
      .set('Authorization', 'Bearer valid-client-token')
      .expect(200);
    await request((await infra.getApp()).getHttpServer())
      .get('/')
      .set('Authorization', 'Bearer valid-user-token')
      .expect(403);
  });

  it('does not grant access with wrong grant type on method level', async () => {
    @Controller()
    class TestController {
      @Get('')
      @AllowResourceOwnerType(ResourceOwnerType.CLIENT)
      get() {
        return 'ok';
      }

      @Get('needs-auth')
      needsAuth() {
        return 'ok';
      }
    }
    const { infra, testClient } = await createInfrastructureWithController([
      TestController,
    ]);
    testClient.addClientToken('valid-client-token', []);
    testClient.addUserToken('valid-user-token', []);

    await request((await infra.getApp()).getHttpServer())
      .get('/')
      .set('Authorization', 'Bearer valid-client-token')
      .expect(200);
    await request((await infra.getApp()).getHttpServer())
      .get('/')
      .set('Authorization', 'Bearer valid-user-token')
      .expect(403);

    await request((await infra.getApp()).getHttpServer())
      .get('/needs-auth')
      .set('Authorization', 'Bearer valid-client-token')
      .expect(403);
    await request((await infra.getApp()).getHttpServer())
      .get('/needs-auth')
      .set('Authorization', 'Bearer valid-user-token')
      .expect(200);
  });

  it('method level overwrites class level', async () => {
    @Controller()
    @AllowResourceOwnerType(ResourceOwnerType.CLIENT)
    class TestController {
      @Get('')
      @AllowResourceOwnerType(ResourceOwnerType.USER)
      get() {
        return 'ok';
      }
    }
    const { infra, testClient } = await createInfrastructureWithController([
      TestController,
    ]);
    testClient.addClientToken('valid-client-token', []);
    testClient.addUserToken('valid-user-token', []);

    await request((await infra.getApp()).getHttpServer())
      .get('/')
      .set('Authorization', 'Bearer valid-client-token')
      .expect(403);
    await request((await infra.getApp()).getHttpServer())
      .get('/')
      .set('Authorization', 'Bearer valid-user-token')
      .expect(200);
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
