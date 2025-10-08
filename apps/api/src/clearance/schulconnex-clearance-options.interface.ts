// Visible according to schulconnex spec
export interface SchulconnexClearanceShowFields {
  users: boolean;
  userContexts: boolean;
  organizations: boolean;
  groups: boolean;
  relations: boolean;
}

// Visible according to granted scopes
export interface SchulconnexClearanceVisibleFields {
  name: boolean;
  role: boolean;
  groups: boolean;
  organization: boolean;
  email: boolean;
}
