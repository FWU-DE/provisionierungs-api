import { Reflector } from '@nestjs/core';

export const NoAccessTokenAuthRequired = Reflector.createDecorator<never, boolean | undefined>({
  transform: (isNoAuthRequired?: boolean) => isNoAuthRequired ?? true,
});
