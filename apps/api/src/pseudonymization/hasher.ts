import { ensureError } from '@fwu-rostering/utils/error';
import { createHmac } from 'crypto';
import debug from 'debug';
import type { v3 as uuidv3Type } from 'uuid';

export class Hasher {
  // Will hold the imported UUID v3 function
  // So we can use it in a non-async context
  private uuidv3Fun: typeof uuidv3Type | null = null;
  private debug = debug('vidis:hasher');

  constructor() {
    // Import ESM module into commonJS context
    import('uuid')
      .then((mod) => mod.v3)
      .then((v3) => (this.uuidv3Fun = v3))
      // eslint-disable-next-line no-console
      .catch(console.error);
  }

  private uuidv3(buf: Buffer) {
    if (!this.uuidv3Fun) throw new Error('UUID v3 function not loaded');

    // Upstream: https://github.com/FWU-DE/fwu-kc-extensions/blob/1109b6368a27766eab205d8eca2cc7cad68079a0/hmac-mapper/src/main/java/de/intension/protocol/oidc/mappers/HmacPairwiseSubMapperHelper.java#L47
    // The upstream implementation does not use a UUID as a namespace but rather the first 16 bytes of the hash as a namespace
    const name = buf.subarray(16);
    const namespace = buf.subarray(0, 16);

    return this.uuidv3Fun(name, namespace);
  }

  hash(localSubject: string, salt: string, sectorIdentifierUri: string): string {
    const sectorIdentifier = this.resolveValidSectorIdentifier(sectorIdentifierUri);
    try {
      const hmac = createHmac('sha512', Buffer.from(salt, 'utf8'));
      hmac.update(Buffer.from(sectorIdentifier ?? '', 'utf8'));
      hmac.update(Buffer.from(localSubject, 'utf8'));
      const hashBytes = hmac.digest();
      return this.uuidv3(hashBytes);
    } catch (error: unknown) {
      ensureError(error);
      throw new Error('Generating hash failed: ' + ensureError(error).message);
    }
  }

  // Reimplemented from https://github.com/keycloak/keycloak/blob/85afd624528bbf8850b2def460e06c70e965de54/services/src/main/java/org/keycloak/protocol/oidc/utils/PairwiseSubMapperUtils.java#L54
  private resolveValidSectorIdentifier(sectorIdentifierUri: string): string | null {
    try {
      const url = new URL(sectorIdentifierUri);
      return url.hostname;
    } catch (_: unknown) {
      this.debug('Invalid sectorIdentifierUri "%s"', sectorIdentifierUri);
      return null; // invalid URL
    }
  }
}
