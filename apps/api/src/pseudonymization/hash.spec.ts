import { Hasher } from './hasher';

describe('hash', () => {
  const localSubject = 'user123';
  const salt = 'somesalt';
  const sectorIdentifier = 'example.com';

  let hasher: Hasher;
  beforeAll(async () => {
    hasher = new Hasher();
    await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for dynamic import
  });

  it('test real value', () => {
    const pseudonym = hasher.hash(
      'eduplaces-l1',
      'a7877036-78c8-49e0-b9e2-df600beb989d',
      'https://eduplaces.de',
    );
    expect(pseudonym).toBe('e1be1692-71f5-301c-a1c3-83d655adc9f8');
  });

  it('should generate a deterministic UUID v5 hash for the same inputs', () => {
    const hash1 = hasher.hash(localSubject, salt, sectorIdentifier);
    const hash2 = hasher.hash(localSubject, salt, sectorIdentifier);
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should generate different hashes for different localSubjects', () => {
    const hash1 = hasher.hash('userA', salt, sectorIdentifier);
    const hash2 = hasher.hash('userB', salt, sectorIdentifier);
    expect(hash1).not.toBe(hash2);
  });

  it('should generate different hashes for different salts', () => {
    const hash1 = hasher.hash(localSubject, 'salt1', sectorIdentifier);
    const hash2 = hasher.hash(localSubject, 'salt2', sectorIdentifier);
    expect(hash1).not.toBe(hash2);
  });

  it('should generate different hashes for different sectorIdentifiers', () => {
    const hash1 = hasher.hash(localSubject, salt, 'https://sector1.local');
    const hash2 = hasher.hash(localSubject, salt, 'https://sector2.local');
    expect(hash1).not.toBe(hash2);
  });
});
