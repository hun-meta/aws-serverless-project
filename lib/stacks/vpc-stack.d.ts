import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';
export interface VpcStackProps extends cdk.StackProps {
    readonly config: EnvironmentConfig;
    readonly namingHelper: NamingHelper;
    readonly taggingHelper: TaggingHelper;
}
export declare class VpcStack extends cdk.Stack {
    readonly vpc: ec2.Vpc;
    readonly publicSubnets: ec2.ISubnet[];
    readonly privateSubnets: ec2.ISubnet[];
    readonly databaseSubnets: ec2.ISubnet[];
    constructor(scope: Construct, id: string, props: VpcStackProps);
}
