// Mock Date.now() before any imports
const originalDateNow = Date.now;
Date.now = jest.fn(() => 1705752000000);

import { HealthCheckService } from '../../../src/service/health-check.service';
import { HealthCheckRequestDto } from '../../../src/dto/health-check-request.dto';
import { HealthCheckResponseDto } from '../../../src/dto/health-check-response.dto';
import loggerService from '../../../src/service/logger.service';

// Mock the logger service
jest.mock('../../../src/service/logger.service', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('HealthCheckService', () => {
  let healthCheckService: HealthCheckService;
  const mockLogger = loggerService as jest.Mocked<typeof loggerService>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance
    (HealthCheckService as any).instance = undefined;
    healthCheckService = HealthCheckService.getInstance();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    // Restore original Date.now
    Date.now = originalDateNow;
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton pattern)', () => {
      const instance1 = HealthCheckService.getInstance();
      const instance2 = HealthCheckService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('healthCheck', () => {
    it('should return a healthy response with current timestamp', async () => {
      // Arrange
      const mockDate = new Date('2024-01-20T12:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      const requestDto = new HealthCheckRequestDto(1705752000000); // 2024-01-20T12:00:00.000Z

      // Act
      const result = await healthCheckService.healthCheck(requestDto);

      // Assert
      expect(result).toBeInstanceOf(HealthCheckResponseDto);
      expect(result.isHealthy).toBe(true);
      expect(result.healthCheckTime).toBe('2024-01-20T12:00:00.000Z');
      expect(result.requestTimestamp).toBe(1705752000000);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'HealthCheckService',
        'Health Check Time',
        '2024-01-20T12:00:00.000Z'
      );
    });

    it('should use provided timestamp', async () => {
      // Arrange
      const mockDate = new Date('2024-01-20T12:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      // This test now explicitly provides a timestamp
      const customTimestamp = 1705752000000;
      const requestDto = new HealthCheckRequestDto(customTimestamp);

      // Act
      const result = await healthCheckService.healthCheck(requestDto);

      // Assert
      expect(result.requestTimestamp).toBe(customTimestamp);
    });

    it('should handle error when getting health check time fails', async () => {
      // Arrange
      const mockError = new Error('Date error');
      jest.spyOn(global, 'Date').mockImplementation(() => {
        throw mockError;
      });
      
      const requestDto = new HealthCheckRequestDto(1705752000000);

      // Act & Assert
      await expect(healthCheckService.healthCheck(requestDto)).rejects.toThrow();
    });
  });

  describe('getHealthCheckTime (private method)', () => {
    it('should log the health check time', async () => {
      // Arrange
      const mockDate = new Date('2024-01-20T12:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      const requestDto = new HealthCheckRequestDto(1705752000000);

      // Act
      await healthCheckService.healthCheck(requestDto);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'HealthCheckService',
        'Health Check Time',
        '2024-01-20T12:00:00.000Z'
      );
    });
  });
});