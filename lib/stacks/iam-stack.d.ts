import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';
export interface IamStackProps extends cdk.StackProps {
    readonly config: EnvironmentConfig;
    readonly namingHelper: NamingHelper;
    readonly taggingHelper: TaggingHelper;
}
export declare class IamStack extends cdk.Stack {
    readonly customLambdaLoggingRole: iam.Role;
    readonly customApiGatewayLogRole: iam.Role;
    readonly customLambdaEdgeS3Role: iam.Role;
    readonly customLambdaCommonRole: iam.Role;
    readonly customSchedulerLambdaExecutionRole: iam.Role;
    constructor(scope: Construct, id: string, props: IamStackProps);
}
