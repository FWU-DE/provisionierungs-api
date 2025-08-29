// We were using this to find unused/mistaken parameters. However it broke autocompletion
// type Exact<TObj, TProps> = {
//   [k in keyof TProps]: k extends keyof TObj ? TProps[k] : never;
// };

import type { BaseEntity } from '../../database/base.entity';

export function fixture<T extends BaseEntity, P extends Partial<T>>(
  entityClass: new () => T,
  data: P,
): T & P {
  const ret = new entityClass();

  return Object.assign(ret, data);
}
