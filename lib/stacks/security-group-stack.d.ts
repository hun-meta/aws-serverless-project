import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';
export interface SecurityGroupStackProps extends cdk.StackProps {
    readonly config: EnvironmentConfig;
    readonly namingHelper: NamingHelper;
    readonly taggingHelper: TaggingHelper;
    readonly vpc: ec2.IVpc;
}
export declare class SecurityGroupStack extends cdk.Stack {
    readonly lambdaOutboundGroup: ec2.SecurityGroup;
    readonly publicSshGroup: ec2.SecurityGroup;
    readonly bastionOutboundGroup: ec2.SecurityGroup;
    readonly natGroup: ec2.SecurityGroup;
    readonly dbSshGroup: ec2.SecurityGroup;
    readonly dbPrivateGroup: ec2.SecurityGroup;
    readonly localOutboundGroup: ec2.SecurityGroup;
    constructor(scope: Construct, id: string, props: SecurityGroupStackProps);
}
