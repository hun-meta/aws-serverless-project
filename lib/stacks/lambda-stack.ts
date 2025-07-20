import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../utils/environment';
import { NamingHelper } from '../utils/naming';
import { TaggingHelper } from '../utils/tags';
import { LAMBDA_FUNCTIONS } from '../utils/constants';
import * as path from 'path';

export interface LambdaStackProps extends cdk.StackProps {
  readonly config: EnvironmentConfig;
  readonly namingHelper: NamingHelper;
  readonly taggingHelper: TaggingHelper;
  readonly vpc: ec2.IVpc;
  readonly lambdaSecurityGroup: ec2.ISecurityGroup;
  readonly lambdaRole: iam.IRole;
}

export class LambdaStack extends cdk.Stack {
  public readonly healthCheckFunction: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const { config, namingHelper, taggingHelper, vpc, lambdaSecurityGroup, lambdaRole } = props;

    // Health Check Lambda Function
    this.healthCheckFunction = new lambda.Function(this, 'HealthCheckFunction', {
      functionName: namingHelper.getLambdaFunctionName(LAMBDA_FUNCTIONS.HEALTH_CHECK),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'src/lambda.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../lambda/functions/health-check')
      ),
      memorySize: config.lambda.memorySize,
      timeout: cdk.Duration.seconds(config.lambda.timeout),
      role: lambdaRole,
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
      },
      securityGroups: [lambdaSecurityGroup],
      environment: {
        NODE_ENV: config.stage,
        STAGE: config.stage,
        REGION: config.environment.region,
        LOG_LEVEL: config.isDev ? 'debug' : 'info'
      },
      reservedConcurrentExecutions: config.isProd ? 10 : 5,
      description: 'Health check function for API monitoring'
    });

    // Create Lambda alias for blue/green deployment
    const alias = new lambda.Alias(this, 'HealthCheckAlias', {
      aliasName: config.stage,
      version: this.healthCheckFunction.currentVersion,
      description: `${config.stage} environment alias for health check function`
    });

    // Apply tags to all resources
    taggingHelper.applyTags(this, {
      StackName: 'LambdaStack',
      Purpose: 'Lambda functions for API endpoints'
    });

    // Outputs
    new cdk.CfnOutput(this, 'HealthCheckFunctionArn', {
      value: this.healthCheckFunction.functionArn,
      description: 'Health Check Function ARN',
      exportName: namingHelper.getLogicalId('HealthCheckFunctionArn')
    });

    new cdk.CfnOutput(this, 'HealthCheckFunctionName', {
      value: this.healthCheckFunction.functionName,
      description: 'Health Check Function Name',
      exportName: namingHelper.getLogicalId('HealthCheckFunctionName')
    });

    new cdk.CfnOutput(this, 'HealthCheckAliasArn', {
      value: alias.functionArn,
      description: 'Health Check Function Alias ARN',
      exportName: namingHelper.getLogicalId('HealthCheckAliasArn')
    });
  }
}