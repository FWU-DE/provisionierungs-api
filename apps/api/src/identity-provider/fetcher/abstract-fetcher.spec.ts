import { AbstractFetcher } from './abstract-fetcher';
import { Logger } from '../../logger';
import { type ZodObject, z } from 'zod';
import { type SchulconnexResponse } from './schulconnex/schulconnex-response.interface';
import { type SchulconnexQueryParameters } from '../../controller/types/schulconnex';
import { Test, type TestingModule } from '@nestjs/testing';

// Create a concrete implementation of AbstractFetcher for testing
class TestFetcher extends AbstractFetcher<{ token: string }> {
  public async fetchPersons(
    endpointUrl: string,
    parameters: SchulconnexQueryParameters,
    credentials: { token: string },
  ): Promise<null | SchulconnexResponse[]> {
    void endpointUrl;
    void parameters;
    void credentials;

    // This method is not tested directly in this file
    return Promise.resolve(null);
  }

  public getValidator(): ZodObject {
    return z.object({
      test: z.string(),
    });
  }

  // Expose protected methods for testing
  public async testHandleData<T>(response: Response): Promise<T | null> {
    return this.handleData<T>(response);
  }

  public testValidateData<T>(data: T | null): T | null {
    return this.validateData<T>(data);
  }
}

describe('AbstractFetcher', () => {
  let fetcher: TestFetcher;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    // Create a mock for Logger
    mockLogger = {
      error: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestFetcher,
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    fetcher = module.get<TestFetcher>(TestFetcher);
  });

  it('should be defined', () => {
    expect(fetcher).toBeDefined();
  });

  describe('handleData', () => {
    it('should return parsed JSON data when response is ok', async () => {
      // Mock data
      const mockData = { test: 'value' };
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockData),
      } as unknown as Response;

      // Call the method
      const result =
        await fetcher.testHandleData<typeof mockData>(mockResponse);

      // Assertions
      expect(result).toEqual(mockData);
    });

    it('should return null and log error when response is not ok', async () => {
      // Mock data
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Not found'),
      } as unknown as Response;

      // Call the method
      const result = await fetcher.testHandleData<unknown>(mockResponse);

      // Assertions
      expect(result).toBeNull();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to fetch IdP data: 404 Not Found',
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalledWith('Response: Not found');
    });
  });

  describe('validateData', () => {
    it('should return data when validation passes', () => {
      // Mock data
      const mockData = { test: 'value' };

      // Call the method
      const result = fetcher.testValidateData<typeof mockData>(mockData);

      // Assertions
      expect(result).toEqual(mockData);
    });

    it('should return null and log error when validation fails', () => {
      // Mock data with invalid structure
      const mockData = { invalid: 'value' };

      // Call the method
      const result = fetcher.testValidateData<typeof mockData>(mockData);

      // Assertions
      expect(result).toBeNull();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should return null when input is null', () => {
      // Call the method with null
      const result = fetcher.testValidateData<unknown>(null);

      // Assertions
      expect(result).toBeNull();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
