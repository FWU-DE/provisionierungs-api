import { Test, type TestingModule } from '@nestjs/testing';
import { type ZodObject, z } from 'zod';

import { Logger } from '../../common/logger';
import { type SchulconnexOrganizationQueryParameters } from '../../controller/parameters/schulconnex-organisations-query-parameters';
import { type SchulconnexPersonsQueryParameters } from '../../controller/parameters/schulconnex-persons-query-parameters';
import { type BearerToken } from '../authentication/bearer-token';
import { type SchulconnexGroup } from '../dto/schulconnex/schulconnex-group.dto';
import { type SchulconnexOrganization } from '../dto/schulconnex/schulconnex-organization.dto';
import { AbstractFetcher } from './abstract-fetcher';
import { type SchulconnexPersonsResponse } from './schulconnex/schulconnex-response.interface';

// Create a concrete implementation of AbstractFetcher for testing
class TestFetcher extends AbstractFetcher<{ token: string }> {
  public async fetchPersons(
    endpointUrl: string,
    parameters: SchulconnexPersonsQueryParameters,
    credentials: { token: string },
  ): Promise<null | SchulconnexPersonsResponse[]> {
    void endpointUrl;
    void parameters;
    void credentials;

    // This method is not tested directly in this file
    return Promise.resolve(null);
  }

  public async fetchOrganizations(
    endpointUrl: string,
    parameters: SchulconnexOrganizationQueryParameters,
    { token }: BearerToken,
  ): Promise<null | SchulconnexOrganization[]> {
    void endpointUrl;
    void parameters;
    void token;

    return Promise.resolve(null);
  }

  public async fetchGroups(
    endpointUrl: string,
    credentials: { token: string },
  ): Promise<SchulconnexGroup[]> {
    void endpointUrl;
    void credentials;

    // This method is not tested directly in this file
    return Promise.resolve([]);
  }

  public getPersonsValidator(): ZodObject {
    return z.object({
      test: z.string(),
    });
  }

  public override getOrganizationsValidator(): ZodObject | z.ZodArray {
    throw new Error('Method not implemented.');
  }

  // Expose protected methods for testing
  public async testHandleData<T>(response: Response): Promise<T | null> {
    return this.handleData<T>(response);
  }

  public testValidateData<T>(data: T | null): T | null {
    return this.validatePersonsData<T>(data);
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
      const result = await fetcher.testHandleData<typeof mockData>(mockResponse);

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
        'Failed to fetch IDM data: 404 Not Found (unknown endpoint URL)',
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

    it('should throw an error when validation fails', () => {
      // Mock data with invalid structure
      const mockData = { invalid: 'value' };

      expect(() => fetcher.testValidateData<typeof mockData>(mockData)).toThrow(Error);
    });

    it('should throw an error when input is null', () => {
      expect(() => fetcher.testValidateData<unknown>(null)).toThrow(Error);
    });
  });
});
