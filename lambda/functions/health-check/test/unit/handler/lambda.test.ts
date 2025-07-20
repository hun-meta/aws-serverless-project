import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { HealthCheckResponseDto } from '../../../src/dto/health-check-response.dto';

// Create mock functions first
const mockHealthCheckFn = jest.fn();
const mockResponseHandlerSuccess = jest.fn();
const mockResponseHandlerError = jest.fn();
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();

// Mock the modules using doMock for better control
jest.doMock('../../../src/service/health-check.service', () => ({
  HealthCheckService: {
    getInstance: jest.fn(() => ({
      healthCheck: mockHealthCheckFn,
    })),
  },
}));

jest.doMock('../../../src/service/logger.service', () => ({
  info: mockLoggerInfo,
  error: mockLoggerError,
  warn: jest.fn(),
  debug: jest.fn(),
}));

jest.doMock('@hun_meta/lambda-common', () => ({
  ResponseHandler: {
    success: mockResponseHandlerSuccess,
    error: mockResponseHandlerError,
  },
}));

// Import handler after setting up mocks
import { handler } from '../../../src/lambda';

describe('Lambda Handler', () => {

  const mockContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'health-check',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:health-check',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/health-check',
    logStreamName: '2024/01/20/[$LATEST]test',
    getRemainingTimeInMillis: () => 30000,
    done: jest.fn(),
    fail: jest.fn(),
    succeed: jest.fn(),
  };

  const createMockEvent = (body?: any): APIGatewayProxyEvent => ({
    body: body ? JSON.stringify(body) : null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/health',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'test-api-id',
      authorizer: null,
      protocol: 'HTTP/1.1',
      httpMethod: 'POST',
      path: '/health',
      stage: 'test',
      requestId: 'test-request-id',
      requestTime: '20/Jan/2024:12:00:00 +0000',
      requestTimeEpoch: 1705752000000,
      resourceId: 'test-resource-id',
      resourcePath: '/health',
      identity: {
        cognitoIdentityPoolId: null,
        accountId: null,
        cognitoIdentityId: null,
        caller: null,
        sourceIp: '127.0.0.1',
        principalOrgId: null,
        accessKey: null,
        cognitoAuthenticationType: null,
        cognitoAuthenticationProvider: null,
        userArn: null,
        userAgent: 'test-user-agent',
        user: null,
        apiKey: null,
        apiKeyId: null,
        clientCert: null,
      },
    },
    resource: '/health',
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mocks to ensure clean state
    mockHealthCheckFn.mockClear();
    mockResponseHandlerSuccess.mockClear();
    mockResponseHandlerError.mockClear();
    mockLoggerInfo.mockClear();
    mockLoggerError.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Successful health check', () => {
    it('should return success response when health check passes', async () => {
      // Arrange
      const mockEvent = createMockEvent({ requestTimestamp: 1705752000000 });
      const mockHealthCheckResponse = new HealthCheckResponseDto(
        true,
        '2024-01-20T12:00:00.000Z',
        1705752000000
      );
      const mockSuccessResponse: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Health check completed successfully',
          data: mockHealthCheckResponse,
        }),
      };

      // Setup mocks
      mockHealthCheckFn.mockResolvedValue(mockHealthCheckResponse);
      mockResponseHandlerSuccess.mockReturnValue(mockSuccessResponse);

      // Act
      const result = await handler(mockEvent, mockContext);

      // Assert
      expect(mockHealthCheckFn).toHaveBeenCalledWith(
        expect.objectContaining({
          requestTimestamp: 1705752000000,
        })
      );
      expect(mockResponseHandlerSuccess).toHaveBeenCalledWith(
        mockHealthCheckResponse,
        'Health check completed successfully'
      );
      expect(result).toEqual(mockSuccessResponse);
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'HealthCheckLambda',
        'Health check request received',
        expect.objectContaining({
          requestId: 'test-request-id',
          httpMethod: 'POST',
          path: '/health',
        })
      );
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        'HealthCheckLambda',
        'Health check completed',
        expect.objectContaining({
          requestId: 'test-request-id',
          status: 'success',
          healthy: true,
        })
      );
    });

    it('should handle request without body', async () => {
      // Arrange
      const mockEvent = createMockEvent(); // No body
      const mockHealthCheckResponse = new HealthCheckResponseDto(
        true,
        '2024-01-20T12:00:00.000Z',
        Date.now()
      );
      const mockSuccessResponse: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Health check completed successfully',
          data: mockHealthCheckResponse,
        }),
      };

      // Setup mocks
      mockHealthCheckFn.mockResolvedValue(mockHealthCheckResponse);
      mockResponseHandlerSuccess.mockReturnValue(mockSuccessResponse);

      // Act
      const result = await handler(mockEvent, mockContext);

      // Assert
      expect(mockHealthCheckFn).toHaveBeenCalled();
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should handle empty body object', async () => {
      // Arrange
      const mockEvent = createMockEvent({}); // Empty body
      const mockHealthCheckResponse = new HealthCheckResponseDto(
        true,
        '2024-01-20T12:00:00.000Z',
        Date.now()
      );
      const mockSuccessResponse: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Health check completed successfully',
          data: mockHealthCheckResponse,
        }),
      };

      // Setup mocks
      mockHealthCheckFn.mockResolvedValue(mockHealthCheckResponse);
      mockResponseHandlerSuccess.mockReturnValue(mockSuccessResponse);

      // Act
      const result = await handler(mockEvent, mockContext);

      // Assert
      expect(mockHealthCheckFn).toHaveBeenCalled();
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('Error handling', () => {
    it('should return error response when health check fails', async () => {
      // Arrange
      const mockEvent = createMockEvent({ requestTimestamp: 1705752000000 });
      const mockError = new Error('Health check service error');
      const mockErrorResponse: APIGatewayProxyResult = {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Health check failed',
          error: mockError.message,
        }),
      };

      // Setup mocks
      mockHealthCheckFn.mockRejectedValue(mockError);
      mockResponseHandlerError.mockReturnValue(mockErrorResponse);

      // Act
      const result = await handler(mockEvent, mockContext);

      // Assert
      expect(mockResponseHandlerError).toHaveBeenCalledWith(
        mockError,
        'Health check failed'
      );
      expect(result).toEqual(mockErrorResponse);
      expect(mockLoggerError).toHaveBeenCalledWith(
        'HealthCheckLambda',
        'Health check failed',
        expect.objectContaining({
          requestId: 'test-request-id',
          error: 'Health check service error',
          stack: expect.any(String),
        })
      );
    });

    it('should handle JSON parse errors', async () => {
      // Arrange
      const mockEvent = createMockEvent();
      mockEvent.body = 'invalid json'; // Invalid JSON
      const mockErrorResponse: APIGatewayProxyResult = {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          message: 'Health check failed',
          error: 'JSON parse error',
        }),
      };

      mockResponseHandlerError.mockReturnValue(mockErrorResponse);

      // Act
      const result = await handler(mockEvent, mockContext);

      // Assert
      expect(mockResponseHandlerError).toHaveBeenCalledWith(
        expect.any(SyntaxError),
        'Health check failed'
      );
      expect(result).toEqual(mockErrorResponse);
      expect(mockLoggerError).toHaveBeenCalledWith(
        'HealthCheckLambda',
        'Health check failed',
        expect.objectContaining({
          requestId: 'test-request-id',
          error: expect.stringContaining('JSON'),
        })
      );
    });
  });
});