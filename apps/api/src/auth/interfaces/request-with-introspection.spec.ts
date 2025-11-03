import { keycloakIntrospectionSchema } from '../introspection/introspection-client';

describe('RequestWithIntrospection', () => {
  describe('keycloakIntrospectionSchema', () => {
    it('validates expired', () => {
      const introspection = keycloakIntrospectionSchema.parse({
        active: false,
      });
      expect(introspection).toEqual({ active: false });
    });

    it('validates with additional keys', () => {
      const raw = {
        active: true,
        client_id: '::client-id::',
        scope: 'scope1 scope2',
        sub: '::sub::',
        username: '::username::',
        typ: 'Bearer',
        // Additional keys that may be present but are not validated
        exp: 1234567890,
        iat: 1234560000,
        iss: 'http://example.local/',
        jti: '::jti::',
      };

      const introspection = keycloakIntrospectionSchema.parse(raw);
      expect(introspection).toEqual({
        active: true,
        client_id: '::client-id::',
        scope: 'scope1 scope2',
        sub: '::sub::',
        username: '::username::',
        typ: 'Bearer',
      });
    });

    it('validates bad object', () => {
      const raw = {
        active: true,
        client_id: 0,
        scope: 0,
        sub: '::sub::',
        username: '::username::',
        typ: 'BadType',
      };

      const { error, success } = keycloakIntrospectionSchema.safeParse(raw);
      expect(success).toBe(false);
      expect(error?.issues).toEqual([
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Invalid input: expected string, received number',
          path: ['scope'],
        },
        {
          code: 'invalid_type',
          expected: 'string',
          message: 'Invalid input: expected string, received number',
          path: ['client_id'],
        },
        {
          code: 'invalid_value',
          message: 'Invalid option: expected one of "Bearer"|"ID"',
          path: ['typ'],
          values: ['Bearer', 'ID'],
        },
      ]);
    });
  });
});
