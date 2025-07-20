import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';
export interface LambdaStackProps extends cdk.StackProps {
    readonly config: EnvironmentConfig;
    readonly namingHelper: NamingHelper;
    readonly taggingHelper: TaggingHelper;
    readonly vpc: ec2.IVpc;
    readonly lambdaSecurityGroup: ec2.ISecurityGroup;
    readonly lambdaRole: iam.IRole;
}
export declare class LambdaStack extends cdk.Stack {
    readonly healthCheckFunction: lambda.Function;
    constructor(scope: Construct, id: string, props: LambdaStackProps);
}
