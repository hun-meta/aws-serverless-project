import { handler } from '../../src/lambda';
import { createMockContext, createMockAPIGatewayEvent, testTimestamp } from '../fixtures/test-data';

describe('Health Check Lambda Integration Tests', () => {
  const mockContext = createMockContext();

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables if needed
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('End-to-end health check flow', () => {
    it('should successfully process health check request with timestamp', async () => {
      // Arrange
      const mockEvent = createMockAPIGatewayEvent({
        requestTimestamp: testTimestamp
      });

      // Act
      const response = await handler(mockEvent, mockContext);

      // Assert
      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody).toMatchObject({
        success: true,
        message: 'Health check completed successfully',
        data: {
          isHealthy: true,
          healthCheckTime: expect.any(String),
          requestTimestamp: testTimestamp
        }
      });

      // Verify ISO string format
      const healthCheckTime = new Date(responseBody.data.healthCheckTime);
      expect(healthCheckTime).toBeInstanceOf(Date);
      expect(isNaN(healthCheckTime.getTime())).toBe(false);
    });

    it('should successfully process health check request without timestamp', async () => {
      // Arrange
      const mockEvent = createMockAPIGatewayEvent(); // No body

      // Act
      const response = await handler(mockEvent, mockContext);

      // Assert
      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody).toMatchObject({
        success: true,
        message: 'Health check completed successfully',
        data: {
          isHealthy: true,
          healthCheckTime: expect.any(String),
          requestTimestamp: expect.any(Number)
        }
      });

      // Verify timestamp is recent (within last 5 seconds)
      const now = Date.now();
      expect(responseBody.data.requestTimestamp).toBeGreaterThan(now - 5000);
      expect(responseBody.data.requestTimestamp).toBeLessThanOrEqual(now);
    });

    it('should handle malformed JSON in request body', async () => {
      // Arrange
      const mockEvent = createMockAPIGatewayEvent();
      mockEvent.body = '{ invalid json }';

      // Act
      const response = await handler(mockEvent, mockContext);

      // Assert
      expect(response.statusCode).toBe(500); // JSON parsing error results in 500 error
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toContain('Health check failed');
    });

    it('should handle different HTTP methods gracefully', async () => {
      // Arrange
      const mockEvent = createMockAPIGatewayEvent(
        { requestTimestamp: testTimestamp },
        { httpMethod: 'GET' }
      );

      // Act
      const response = await handler(mockEvent, mockContext);

      // Assert
      expect(response.statusCode).toBe(200);
      
      const responseBody = JSON.parse(response.body);
      expect(responseBody.success).toBe(true);
      expect(responseBody.data.isHealthy).toBe(true);
    });
  });

  describe('Performance and resource usage', () => {
    it('should complete health check within reasonable time', async () => {
      // Arrange
      const mockEvent = createMockAPIGatewayEvent({
        requestTimestamp: testTimestamp
      });
      const startTime = Date.now();

      // Act
      await handler(mockEvent, mockContext);
      const endTime = Date.now();

      // Assert
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle concurrent requests', async () => {
      // Arrange
      const requests = Array(10).fill(null).map(() => 
        createMockAPIGatewayEvent({ requestTimestamp: Date.now() })
      );

      // Act
      const responses = await Promise.all(
        requests.map(event => handler(event, mockContext))
      );

      // Assert
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.success).toBe(true);
        expect(responseBody.data.isHealthy).toBe(true);
      });
    });
  });
});