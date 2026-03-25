import * as gqlTada from 'gql.tada';

/* eslint-disable */
/* prettier-ignore */

export type introspection_types = {
    'Boolean': unknown;
    'Float': unknown;
    'GroupClearanceDeleteResponseDto': { kind: 'OBJECT'; name: 'GroupClearanceDeleteResponseDto'; fields: { 'deleted': { name: 'deleted'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; }; };
    'GroupClearanceResponseDto': { kind: 'OBJECT'; name: 'GroupClearanceResponseDto'; fields: { 'groupId': { name: 'groupId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'idmId': { name: 'idmId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerId': { name: 'offerId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; 'schoolId': { name: 'schoolId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'GroupDto': { kind: 'OBJECT'; name: 'GroupDto'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'name': { name: 'name'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'Int': unknown;
    'Mutation': { kind: 'OBJECT'; name: 'Mutation'; fields: { 'createGroupClearance': { name: 'createGroupClearance'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'GroupClearanceResponseDto'; ofType: null; }; } }; 'createSchoolClearance': { name: 'createSchoolClearance'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'SchoolClearanceResponseDto'; ofType: null; }; } }; 'deleteAllGroupClearances': { name: 'deleteAllGroupClearances'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'GroupClearanceDeleteResponseDto'; ofType: null; }; } }; 'deleteGroupClearance': { name: 'deleteGroupClearance'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'GroupClearanceDeleteResponseDto'; ofType: null; }; } }; 'deleteSchoolClearance': { name: 'deleteSchoolClearance'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'SchoolClearanceDeleteResponseDto'; ofType: null; }; } }; }; };
    'OffersDto': { kind: 'OBJECT'; name: 'OffersDto'; fields: { 'educationProviderOrganizationName': { name: 'educationProviderOrganizationName'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerDescription': { name: 'offerDescription'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerId': { name: 'offerId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; 'offerLink': { name: 'offerLink'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerLogo': { name: 'offerLogo'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerLongTitle': { name: 'offerLongTitle'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerTitle': { name: 'offerTitle'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
    'Query': { kind: 'OBJECT'; name: 'Query'; fields: { 'allGroupClearances': { name: 'allGroupClearances'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'GroupClearanceResponseDto'; ofType: null; }; }; }; } }; 'allGroups': { name: 'allGroups'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'GroupDto'; ofType: null; }; }; }; } }; 'allOffers': { name: 'allOffers'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'OffersDto'; ofType: null; }; }; }; } }; 'allSchoolClearances': { name: 'allSchoolClearances'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'LIST'; name: never; ofType: { kind: 'NON_NULL'; name: never; ofType: { kind: 'OBJECT'; name: 'SchoolClearanceResponseDto'; ofType: null; }; }; }; } }; 'offer': { name: 'offer'; type: { kind: 'OBJECT'; name: 'OffersDto'; ofType: null; } }; }; };
    'SchoolClearanceDeleteResponseDto': { kind: 'OBJECT'; name: 'SchoolClearanceDeleteResponseDto'; fields: { 'deleted': { name: 'deleted'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Boolean'; ofType: null; }; } }; }; };
    'SchoolClearanceResponseDto': { kind: 'OBJECT'; name: 'SchoolClearanceResponseDto'; fields: { 'id': { name: 'id'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'idmId': { name: 'idmId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; 'offerId': { name: 'offerId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'Float'; ofType: null; }; } }; 'schoolId': { name: 'schoolId'; type: { kind: 'NON_NULL'; name: never; ofType: { kind: 'SCALAR'; name: 'String'; ofType: null; }; } }; }; };
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
