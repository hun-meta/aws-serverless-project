import { APIGatewayProxyEvent, Context } from 'aws-lambda';

export const createMockContext = (overrides?: Partial<Context>): Context => ({
  callbackWaitsForEmptyEventLoop: false,
  functionName: 'health-check',
  functionVersion: '1',
  invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:health-check',
  memoryLimitInMB: '128',
  awsRequestId: 'test-request-id-12345',
  logGroupName: '/aws/lambda/health-check',
  logStreamName: '2024/01/20/[$LATEST]test',
  getRemainingTimeInMillis: () => 30000,
  done: jest.fn(),
  fail: jest.fn(),
  succeed: jest.fn(),
  ...overrides,
});

export const createMockAPIGatewayEvent = (
  body?: any,
  overrides?: Partial<APIGatewayProxyEvent>
): APIGatewayProxyEvent => ({
  body: body ? JSON.stringify(body) : null,
  headers: {
    'Content-Type': 'application/json',
  },
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
  ...overrides,
});

export const testTimestamp = 1705752000000; // 2024-01-20T12:00:00.000Z
export const testISOString = '2024-01-20T12:00:00.000Z';