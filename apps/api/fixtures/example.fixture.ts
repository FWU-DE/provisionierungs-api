import { Clearance } from '../src/clearance/clearance.entity';
import { fixture } from '../src/test/fixture/fixture.interface';

const clearance = fixture(Clearance, {
  id: '9eb44f89-1e4f-44a5-ae5b-0ad84841dbb7',
  appId: 'app-xyz',
  idpId: 'idp-xyz',
  organizationId: 'organization-xyz',
});

export default [clearance];
