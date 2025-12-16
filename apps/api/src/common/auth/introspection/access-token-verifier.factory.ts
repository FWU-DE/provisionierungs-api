import { Inject } from '@nestjs/common';

import authConfig, { type AuthConfig } from '../config/auth.config';
import { AccessTokenVerifier } from './access-token-verifier';

export class AccessTokenVerifierFactory {
  constructor(
    @Inject(authConfig.KEY)
    private readonly authConfig: AuthConfig,
  ) {}

  async create() {
    if (this.authConfig.AUTH_VALIDATION !== 'verify-jwt') {
      throw new Error(
        'AccessTokenVerifierFactory can only create AccessTokenVerifier for AUTH_VALIDATION=verify-jwt',
      );
    }
    return AccessTokenVerifier.createFromOpenidConfigurationUrl(
      this.authConfig.AUTH_WELL_KNOWN_URL,
    );
  }
}
