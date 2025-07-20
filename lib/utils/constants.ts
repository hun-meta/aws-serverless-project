export const PROJECT_NAME = 'cdk-prj';
export const PROJECT_PREFIX = 'CdkPrj';

export const STACK_NAMES = {
  VPC: 'VpcStack',
  IAM: 'IamStack',
  SECURITY_GROUP: 'SecurityGroupStack',
  EC2: 'Ec2Stack',
  S3: 'S3Stack',
  DATABASE: 'DatabaseStack',
  LAMBDA: 'LambdaStack',
  API_GATEWAY: 'ApiGatewayStack'
} as const;

export const LAMBDA_FUNCTIONS = {
  HEALTH_CHECK: 'health-check',
  AUTH: 'auth',
  USER: 'user'
} as const;

export const PORTS = {
  HTTP: 80,
  HTTPS: 443,
  SSH: 22,
  MYSQL: 3306
} as const;

export const AVAILABILITY_ZONES = {
  PRIMARY: 'a',
  SECONDARY: 'c'
} as const;

export const SUBNET_TYPES = {
  PUBLIC: 'Public',
  PRIVATE: 'Private',
  DATABASE: 'Database'
} as const;