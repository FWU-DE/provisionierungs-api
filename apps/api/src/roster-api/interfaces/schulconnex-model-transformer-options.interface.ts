// Visible according to schulconnex spec
export interface SchulconnexModelTransformerShowFields {
  users: boolean;
  userContexts: boolean;
  organizations: boolean;
  groups: boolean;
  relations: boolean;
}

// Visible according to granted scopes
export interface SchulconnexModelTransformerVisibleFields {
  name: boolean;
  role: boolean;
  groups: boolean;
  organization: boolean;
  email: boolean;
}
