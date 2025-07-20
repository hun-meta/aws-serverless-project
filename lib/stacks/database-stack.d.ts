import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';
export interface DatabaseStackProps extends cdk.StackProps {
    readonly config: EnvironmentConfig;
    readonly namingHelper: NamingHelper;
    readonly taggingHelper: TaggingHelper;
    readonly vpc: ec2.IVpc;
    readonly databaseSecurityGroups: ec2.ISecurityGroup[];
}
export declare class DatabaseStack extends cdk.Stack {
    readonly cluster: rds.DatabaseCluster;
    readonly secret: secretsmanager.Secret;
    constructor(scope: Construct, id: string, props: DatabaseStackProps);
}
