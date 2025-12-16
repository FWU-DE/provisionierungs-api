import { Controller, Get, type Type } from '@nestjs/common';
import request from 'supertest';

import { createTestingInfrastructure } from '../../../test/testing-module';
import { AuthModule } from '../auth.module';
import { IntrospectionClient } from '../introspection/introspection-client';
import { TestIntrospectionClient } from '../introspection/introspection-client.test';
import { RequireScope } from '../route-decorators/require-scope.decorator';

describe('ScopeGuard', () => {
  it('restricts access with wrong scope on class level', async () => {
    @Controller()
    @RequireScope(['scope1'])
    class TestController {
      @Get('')
      get() {
        return 'ok';
      }
    }
    const { infra, testClient } = await createInfrastructureWithController([TestController]);
    testClient.addUserToken('valid-user-token', ['wrong-scope']);
    try {
      await request((await infra.getApp()).getHttpServer())
        .get('/')
        .set('Authorization', 'Bearer valid-user-token')
        .expect(403);
    } finally {
      await infra.tearDown();
    }
  });

  it('restricts access with wrong scope on method level', async () => {
    @Controller()
    class TestController {
      @Get('')
      @RequireScope(['scope1'])
      get() {
        return 'ok';
      }
    }
    const { infra, testClient } = await createInfrastructureWithController([TestController]);
    testClient.addUserToken('valid-user-token', ['wrong-scope']);
    try {
      await request((await infra.getApp()).getHttpServer())
        .get('/')
        .set('Authorization', 'Bearer valid-user-token')
        .expect(403);
    } finally {
      await infra.tearDown();
    }
  });

  it('method level overwrites class level', async () => {
    @Controller()
    @RequireScope(['scope1'])
    class TestController {
      @Get('')
      @RequireScope(['scope2'])
      get() {
        return 'ok';
      }
    }
    const { infra, testClient } = await createInfrastructureWithController([TestController]);
    testClient.addUserToken('invalid-user-token', ['scope1']);
    testClient.addUserToken('valid-user-token', ['scope2']);
    try {
      await request((await infra.getApp()).getHttpServer())
        .get('/')
        .set('Authorization', 'Bearer valid-user-token')
        .expect(200);
      await request((await infra.getApp()).getHttpServer())
        .get('/')
        .set('Authorization', 'Bearer invalid-user-token')
        .expect(403);
    } finally {
      await infra.tearDown();
    }
  });

  it('multiple scopes', async () => {
    @Controller()
    class TestController {
      @Get('')
      @RequireScope([['scope1', 'scope2']])
      get() {
        return 'ok';
      }
    }
    const { infra, testClient } = await createInfrastructureWithController([TestController]);
    testClient.addUserToken('invalid-user-token', ['scope1']);
    testClient.addUserToken('valid-user-token', ['scope1', 'scope2']);
    try {
      await request((await infra.getApp()).getHttpServer())
        .get('/')
        .set('Authorization', 'Bearer valid-user-token')
        .expect(200);
      await request((await infra.getApp()).getHttpServer())
        .get('/')
        .set('Authorization', 'Bearer invalid-user-token')
        .expect(403);
    } finally {
      await infra.tearDown();
    }
  });

  it('ORed scopes', async () => {
    @Controller()
    class TestController {
      @Get('')
      @RequireScope(['scope1', ['scope2', 'scope3']])
      get() {
        return 'ok';
      }
    }
    const { infra, testClient } = await createInfrastructureWithController([TestController]);
    testClient.addUserToken('one-user-token', ['scope1']);
    testClient.addUserToken('two-user-token', ['scope2']);
    testClient.addUserToken('three-user-token', ['scope1', 'scope2']);
    try {
      await request((await infra.getApp()).getHttpServer())
        .get('/')
        .set('Authorization', 'Bearer one-user-token')
        .expect(200);
      await request((await infra.getApp()).getHttpServer())
        .get('/')
        .set('Authorization', 'Bearer two-user-token')
        .expect(403);
      await request((await infra.getApp()).getHttpServer())
        .get('/')
        .set('Authorization', 'Bearer three-user-token')
        .expect(200);
    } finally {
      await infra.tearDown();
    }
  });

  it('grants access with valid token', async () => {
    @Controller()
    class TestController {
      @Get('')
      @RequireScope(['scope1'])
      get() {
        return 'ok';
      }
    }
    const { infra, testClient } = await createInfrastructureWithController([TestController]);
    testClient.addUserToken('valid-user-token', ['scope1']);
    try {
      await request((await infra.getApp()).getHttpServer())
        .get('/')
        .set('Authorization', 'Bearer valid-user-token')
        .expect(200)
        .expect('ok');
    } finally {
      await infra.tearDown();
    }
  });
});

async function createInfrastructureWithController(controllers: Type<object>[]) {
  const testClient = new TestIntrospectionClient();
  const infra = await createTestingInfrastructure({
    imports: [AuthModule],
    controllers,
  })
    .configureModule((module) => module.overrideProvider(IntrospectionClient).useValue(testClient))
    .build();

  await infra.setUp();

  return { infra, testClient };
}
