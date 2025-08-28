import { Module } from '@nestjs/common';
import { IdentityProvider } from './identity-provider';

@Module({
  providers: [IdentityProvider],
  exports: [IdentityProvider],
})
export class IdentityProviderModule {}
