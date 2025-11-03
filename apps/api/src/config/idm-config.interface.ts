export type IdmApiWithClientCredentialConfig<Name extends string> = {
  [K in
    | 'TOKEN_ENDPOINT'
    | 'API_ENDPOINT'
    | 'CLIENT_ID'
    | 'CLIENT_SECRET' as `${Name}_${K}`]: string;
};
