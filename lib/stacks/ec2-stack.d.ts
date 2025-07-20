import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';
export interface Ec2StackProps extends cdk.StackProps {
    readonly config: EnvironmentConfig;
    readonly namingHelper: NamingHelper;
    readonly taggingHelper: TaggingHelper;
    readonly vpc: ec2.IVpc;
    readonly publicSshSecurityGroup: ec2.ISecurityGroup;
    readonly bastionOutboundSecurityGroup: ec2.ISecurityGroup;
    readonly natSecurityGroup: ec2.ISecurityGroup;
}
export declare class Ec2Stack extends cdk.Stack {
    readonly bastionHost?: ec2.Instance;
    readonly natInstance?: ec2.Instance;
    readonly bastionElasticIp?: ec2.CfnEIP;
    readonly natElasticIp?: ec2.CfnEIP;
    constructor(scope: Construct, id: string, props: Ec2StackProps);
}
