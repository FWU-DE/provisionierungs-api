import { Clearance } from '../src/clearance/clearance.entity';
import { fixture } from '../src/test/fixture/fixture.interface';

const clearance = fixture(Clearance, {
  appId: 'test-app',
  id: '9eb44f89-1e4f-44a5-ae5b-0ad84841dbb7',
});

export default [clearance];
