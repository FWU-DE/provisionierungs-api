import { Reflector } from '@nestjs/core';

export const AccessTokenAuthRequired = Reflector.createDecorator<
  never,
  boolean | undefined
>({
  transform: (isAuthRequired?: boolean) => isAuthRequired ?? true,
});
