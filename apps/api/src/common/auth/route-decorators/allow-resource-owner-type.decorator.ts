import { Reflector } from '@nestjs/core';

import type { ResourceOwnerType } from '../enums/resource-owner-type.enum';

export const AllowResourceOwnerType = Reflector.createDecorator<
  ResourceOwnerType | ResourceOwnerType[] | undefined
>();
