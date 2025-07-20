import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';
export interface ApiGatewayStackProps extends cdk.StackProps {
    readonly config: EnvironmentConfig;
    readonly namingHelper: NamingHelper;
    readonly taggingHelper: TaggingHelper;
    readonly healthCheckFunction: lambda.IFunction;
    readonly apiGatewayRole: iam.IRole;
}
export declare class ApiGatewayStack extends cdk.Stack {
    readonly api: apigateway.RestApi;
    readonly healthCheckResource: apigateway.Resource;
    constructor(scope: Construct, id: string, props: ApiGatewayStackProps);
}
