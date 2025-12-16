export type IdmApiWithClientCredentialConfig<Name extends string> =
  | {
      [K in
        | 'TOKEN_ENDPOINT'
        | 'API_ENDPOINT'
        | 'CLIENT_ID'
        | 'CLIENT_SECRET'
        | 'ENABLED' as `${Name}_${K}`]: K extends 'ENABLED' ? true : string;
    }
  | { [K in 'ENABLED' as `${Name}_${K}`]?: false };
