import * as cdk from 'aws-cdk-lib';

export interface Environment {
  readonly account: string;
  readonly region: string;
}

export interface EnvironmentConfig {
  readonly environment: Environment;
  readonly stage: string;
  readonly isProd: boolean;
  readonly isDev: boolean;
  readonly vpc: VpcConfig;
  readonly database: DatabaseConfig;
  readonly lambda: LambdaConfig;
  readonly ec2: Ec2Config;
  readonly s3: S3Config;
}

export interface VpcConfig {
  readonly cidr: string;
  readonly maxAzs: number;
  readonly natGateways: number;
  readonly natInstances: number;
}

export interface DatabaseConfig {
  readonly minCapacity: number;
  readonly maxCapacity: number;
  readonly backupRetentionDays: number;
  readonly deletionProtection: boolean;
}

export interface LambdaConfig {
  readonly memorySize: number;
  readonly timeout: number;
  readonly runtime: string;
}

export interface Ec2Config {
  readonly instanceType: string;
  readonly keyName: string;
  readonly enableNatInstance: boolean;
}

export interface S3Config {
  readonly publicAccessBlocked: boolean;
  readonly versioning: boolean;
  readonly encryption: boolean;
}

export function getEnvironmentConfig(app: cdk.App): EnvironmentConfig {
  const stage = app.node.tryGetContext('env') || 'dev';
  const isProd = stage === 'prod';
  const isDev = stage === 'dev';

  // Get environment from context
  const environments = app.node.tryGetContext('environments') || {};
  const env = environments[stage] || { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION };

  if (!env.account || !env.region) {
    throw new Error(`Environment configuration not found for stage: ${stage}`);
  }

  return {
    environment: env,
    stage,
    isProd,
    isDev,
    vpc: {
      cidr: isProd ? '10.0.0.0/16' : '10.1.0.0/16',
      maxAzs: 2,
      natGateways: isProd ? 1 : 0,
      natInstances: isProd ? 0 : 1
    },
    database: {
      minCapacity: isProd ? 0.5 : 0.5,
      maxCapacity: isProd ? 4 : 1,
      backupRetentionDays: isProd ? 7 : 1,
      deletionProtection: isProd
    },
    lambda: {
      memorySize: 512,
      timeout: 15,
      runtime: 'nodejs18.x'
    },
    ec2: {
      instanceType: isProd ? 't4g.nano' : 't2.micro',
      keyName: isProd ? 'prod-ec2-key' : 'dev-ec2-key',
      enableNatInstance: !isProd
    },
    s3: {
      publicAccessBlocked: true,
      versioning: true,
      encryption: true
    }
  };
}