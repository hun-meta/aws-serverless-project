import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';
export interface S3StackProps extends cdk.StackProps {
    readonly config: EnvironmentConfig;
    readonly namingHelper: NamingHelper;
    readonly taggingHelper: TaggingHelper;
}
export declare class S3Stack extends cdk.Stack {
    readonly fileStorageBucket: s3.Bucket;
    constructor(scope: Construct, id: string, props: S3StackProps);
}
