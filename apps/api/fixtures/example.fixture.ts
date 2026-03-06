import { GroupClearance } from '../src/clearance/entity/group-clearance.entity';
import { fixture } from '../src/test/fixture/fixture.interface';

const clearance = fixture(GroupClearance, {
  id: '9eb44f89-1e4f-44a5-ae5b-0ad84841dbb7',
  offerId: 12345678,
  schoolId: 'school-xyz',
  idmId: 'idm-xyz',
  groupId: 'group-xyz',
});

export default [clearance];
