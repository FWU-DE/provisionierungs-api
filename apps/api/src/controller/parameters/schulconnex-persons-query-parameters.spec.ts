import {
  SchulconnexPersonsQueryParameters,
  schulconnexQueryParameterCompleteOptions,
} from './schulconnex-persons-query-parameters';

describe('SchulconnexQueryParameters', () => {
  it('should be defined', () => {
    const params = new SchulconnexPersonsQueryParameters();
    expect(params).toBeDefined();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const params = new SchulconnexPersonsQueryParameters();
      expect(params.vollstaendig).toBeInstanceOf(Set);
      expect(params.vollstaendig.size).toBe(0);
      expect(params.pid).toBeUndefined();
      expect(params['personenkontext.id']).toBeUndefined();
      expect(params['gruppe.id']).toBeUndefined();
      expect(params['organisation.id']).toBeUndefined();
    });

    it('should initialize with provided values', () => {
      const params = new SchulconnexPersonsQueryParameters(
        'personen,personenkontexte',
        'test-pid',
        'test-personenkontext',
        'test-gruppe',
        'test-organisation',
      );
      expect(params.vollstaendig.size).toBe(2);
      expect(params.vollstaendig.has('personen')).toBeTruthy();
      expect(params.vollstaendig.has('personenkontexte')).toBeTruthy();
      expect(params.pid).toBe('test-pid');
      expect(params['personenkontext.id']).toBe('test-personenkontext');
      expect(params['gruppe.id']).toBe('test-gruppe');
      expect(params['organisation.id']).toBe('test-organisation');
    });

    it('should filter out invalid vollstaendig values', () => {
      const params = new SchulconnexPersonsQueryParameters(
        'personen,invalid,personenkontexte',
      );
      expect(params.vollstaendig.size).toBe(2);
      expect(params.vollstaendig.has('personen')).toBeTruthy();
      expect(params.vollstaendig.has('personenkontexte')).toBeTruthy();
      // @ts-expect-error Invalid value
      expect(params.vollstaendig.has('invalid')).toBeFalsy();
    });
  });

  describe('clone', () => {
    it('should create a new instance with the same values', () => {
      const original = new SchulconnexPersonsQueryParameters(
        'personen,personenkontexte',
        'test-pid',
        'test-personenkontext',
        'test-gruppe',
        'test-organisation',
      );
      const clone = original.clone();

      // Verify it's a new instance
      expect(clone).not.toBe(original);

      // Verify values are the same
      expect(clone.vollstaendig.size).toBe(original.vollstaendig.size);
      expect(Array.from(clone.vollstaendig)).toEqual(
        Array.from(original.vollstaendig),
      );
      expect(clone.pid).toBe(original.pid);
      expect(clone['personenkontext.id']).toBe(original['personenkontext.id']);
      expect(clone['gruppe.id']).toBe(original['gruppe.id']);
      expect(clone['organisation.id']).toBe(original['organisation.id']);
    });
  });

  describe('toUrlSearchParams', () => {
    it('should return empty string for empty parameters', () => {
      const params = new SchulconnexPersonsQueryParameters();
      expect(params.toUrlSearchParams()).toBe('');
    });

    it('should include vollstaendig parameter when set', () => {
      const params = new SchulconnexPersonsQueryParameters(
        'personen,personenkontexte',
      );
      expect(params.toUrlSearchParams()).toBe(
        'vollstaendig=personen%2Cpersonenkontexte',
      );
    });

    it('should include pid parameter when set', () => {
      const params = new SchulconnexPersonsQueryParameters(
        undefined,
        'test-pid',
      );
      expect(params.toUrlSearchParams()).toBe('pid=test-pid');
    });

    it('should include personenkontext.id parameter when set', () => {
      const params = new SchulconnexPersonsQueryParameters(
        undefined,
        undefined,
        'test-personenkontext',
      );
      expect(params.toUrlSearchParams()).toBe(
        'personenkontext.id=test-personenkontext',
      );
    });

    it('should include gruppe.id parameter when set', () => {
      const params = new SchulconnexPersonsQueryParameters(
        undefined,
        undefined,
        undefined,
        'test-gruppe',
      );
      expect(params.toUrlSearchParams()).toBe('gruppe.id=test-gruppe');
    });

    it('should include organisation.id parameter when set', () => {
      const params = new SchulconnexPersonsQueryParameters(
        undefined,
        undefined,
        undefined,
        undefined,
        'test-organisation',
      );
      expect(params.toUrlSearchParams()).toBe(
        'organisation.id=test-organisation',
      );
    });

    it('should include all parameters when all are set', () => {
      const params = new SchulconnexPersonsQueryParameters(
        'personen',
        'test-pid',
        'test-personenkontext',
        'test-gruppe',
        'test-organisation',
      );
      const urlParams = params.toUrlSearchParams();

      // Check that all parameters are included
      expect(urlParams).toContain('vollstaendig=personen');
      expect(urlParams).toContain('pid=test-pid');
      expect(urlParams).toContain('personenkontext.id=test-personenkontext');
      expect(urlParams).toContain('gruppe.id=test-gruppe');
      expect(urlParams).toContain('organisation.id=test-organisation');
    });
  });

  describe('vollstaendig validation', () => {
    it('should only accept valid vollstaendig values', () => {
      // Test all valid values
      schulconnexQueryParameterCompleteOptions.forEach((option) => {
        const params = new SchulconnexPersonsQueryParameters(option);
        expect(params.vollstaendig.has(option)).toBeTruthy();
      });

      // Test invalid value
      const params = new SchulconnexPersonsQueryParameters('invalid');
      expect(params.vollstaendig.size).toBe(0);
    });
  });
});
