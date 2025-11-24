import * as gqlTada from 'gql.tada';

/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
    'Boolean': unknown;
    'Clearance': { kind: 'OBJECT'; name: 'Clearance'; fields: { 'clientId': { name: 'clientId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'createdAt': { name: 'createdAt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; } }; 'deletedAt': { name: 'deletedAt'; type: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; } }; 'groupId': { name: 'groupId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'ID'; ofType: null; }; } }; 'idmId': { name: 'idmId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'schoolId': { name: 'schoolId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'updatedAt': { name: 'updatedAt'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'DateTime'; ofType: null; }; } }; }; };
    'DateTime': unknown;
    'Float': unknown;
    'ID': unknown;
    'OffersDto': { kind: 'OBJECT'; name: 'OffersDto'; fields: { 'educationProviderOrganizationName': { name: 'educationProviderOrganizationName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerDescription': { name: 'offerDescription'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerId': { name: 'offerId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; 'offerLink': { name: 'offerLink'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerLogo': { name: 'offerLogo'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerLongTitle': { name: 'offerLongTitle'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerResourcePk': { name: 'offerResourcePk'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; 'offerStatus': { name: 'offerStatus'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerTitle': { name: 'offerTitle'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerVersion': { name: 'offerVersion'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; }; };
    'Query': { kind: 'OBJECT'; name: 'Query'; fields: { 'allClearances': { name: 'allClearances'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Clearance'; ofType: null; }; }; }; } }; 'allOffers': { name: 'allOffers'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'OffersDto'; ofType: null; }; }; }; } }; }; };
    'String': unknown;
};

/** An IntrospectionQuery representation of your schema.
 *
 * @remarks
 * This is an introspection of your schema saved as a file by GraphQLSP.
 * It will automatically be used by `gql.tada` to infer the types of your GraphQL documents.
 * If you need to reuse this data or update your `scalars`, update `tadaOutputLocation` to
 * instead save to a .ts instead of a .d.ts file.
 */
export type introspection = {
  name: never;
  query: 'Query';
  mutation: never;
  subscription: never;
  types: introspection_types;
};

declare module 'gql.tada' {
  interface setupSchema {
    introspection: introspection;
  }
}
