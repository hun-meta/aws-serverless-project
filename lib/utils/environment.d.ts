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
export declare function getEnvironmentConfig(app: cdk.App): EnvironmentConfig;
