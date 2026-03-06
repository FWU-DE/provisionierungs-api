import * as gqlTada from 'gql.tada';

/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
    'Boolean': unknown;
    'Float': unknown;
    'Group': { kind: 'OBJECT'; name: 'Group'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'GroupClearanceDeleteResponse': { kind: 'OBJECT'; name: 'GroupClearanceDeleteResponse'; fields: { 'deleted': { name: 'deleted'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; }; };
    'GroupClearanceResponse': { kind: 'OBJECT'; name: 'GroupClearanceResponse'; fields: { 'groupId': { name: 'groupId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'idmId': { name: 'idmId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerId': { name: 'offerId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; 'schoolId': { name: 'schoolId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'Int': unknown;
    'Mutation': { kind: 'OBJECT'; name: 'Mutation'; fields: { 'createGroupClearance': { name: 'createGroupClearance'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'GroupClearanceResponse'; ofType: null; }; } }; 'createSchoolClearance': { name: 'createSchoolClearance'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'SchoolClearanceResponse'; ofType: null; }; } }; 'deleteAllGroupClearances': { name: 'deleteAllGroupClearances'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'GroupClearanceDeleteResponse'; ofType: null; }; } }; 'deleteGroupClearance': { name: 'deleteGroupClearance'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'GroupClearanceDeleteResponse'; ofType: null; }; } }; 'deleteSchoolClearance': { name: 'deleteSchoolClearance'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'SchoolClearanceDeleteResponse'; ofType: null; }; } }; }; };
    'OffersDto': { kind: 'OBJECT'; name: 'OffersDto'; fields: { 'educationProviderOrganizationName': { name: 'educationProviderOrganizationName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerDescription': { name: 'offerDescription'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerId': { name: 'offerId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; 'offerLink': { name: 'offerLink'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerLogo': { name: 'offerLogo'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerLongTitle': { name: 'offerLongTitle'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerTitle': { name: 'offerTitle'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'Query': { kind: 'OBJECT'; name: 'Query'; fields: { 'allGroupClearances': { name: 'allGroupClearances'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'GroupClearanceResponse'; ofType: null; }; }; }; } }; 'allGroups': { name: 'allGroups'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'Group'; ofType: null; }; }; }; } }; 'allOffers': { name: 'allOffers'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'OffersDto'; ofType: null; }; }; }; } }; 'allSchoolClearances': { name: 'allSchoolClearances'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'SchoolClearanceResponse'; ofType: null; }; }; }; } }; 'offer': { name: 'offer'; type: { kind: 'OBJECT'; name: 'OffersDto'; ofType: null; } }; }; };
    'SchoolClearanceDeleteResponse': { kind: 'OBJECT'; name: 'SchoolClearanceDeleteResponse'; fields: { 'deleted': { name: 'deleted'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; }; };
    'SchoolClearanceResponse': { kind: 'OBJECT'; name: 'SchoolClearanceResponse'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'idmId': { name: 'idmId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerId': { name: 'offerId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; 'schoolId': { name: 'schoolId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
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
  mutation: 'Mutation';
  subscription: never;
  types: introspection_types;
};

declare module 'gql.tada' {
  interface setupSchema {
    introspection: introspection;
  }
}
