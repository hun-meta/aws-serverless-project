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

export class IamStack extends cdk.Stack {
  public readonly customLambdaLoggingRole: iam.Role;
  public readonly customApiGatewayLogRole: iam.Role;
  public readonly customLambdaEdgeS3Role: iam.Role;
  public readonly customLambdaCommonRole: iam.Role;
  public readonly customSchedulerLambdaExecutionRole: iam.Role;

  constructor(scope: Construct, id: string, props: IamStackProps) {
    super(scope, id, props);

    const { config, namingHelper, taggingHelper } = props;

    // Custom Lambda Logging Policy
    const customLambdaLoggingPolicy = new iam.ManagedPolicy(this, 'CustomLambdaLoggingPolicy', {
      managedPolicyName: namingHelper.getIamPolicyName('CustomLambdaLoggingPolicy'),
      description: 'Custom policy for Lambda logging permissions',
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'logs:CreateLogStream',
            'logs:CreateLogGroup',
            'logs:TagResource'
          ],
          resources: ['*']
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'logs:PutLogEvents'
          ],
          resources: ['*']
        })
      ]
    });

    // Custom Lambda Logging Role
    this.customLambdaLoggingRole = new iam.Role(this, 'CustomLambdaLoggingRole', {
      roleName: namingHelper.getIamRoleName('CustomLambdaLoggingRole'),
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Custom role for Lambda logging',
      managedPolicies: [customLambdaLoggingPolicy]
    });

    // Custom API Gateway Log Role
    this.customApiGatewayLogRole = new iam.Role(this, 'CustomApiGatewayLogRole', {
      roleName: namingHelper.getIamRoleName('CustomApiGatewayLogRole'),
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      description: 'Custom role for API Gateway logging',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs')
      ]
    });

    // Custom Lambda Edge S3 Role
    this.customLambdaEdgeS3Role = new iam.Role(this, 'CustomLambdaEdgeS3Role', {
      roleName: namingHelper.getIamRoleName('CustomLambdaEdgeS3'),
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('edgelambda.amazonaws.com')
      ),
      description: 'Custom role for Lambda Edge and S3 access',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_ReadOnlyAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
        customLambdaLoggingPolicy,
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess')
      ]
    });

    // Custom Lambda Common Role
    this.customLambdaCommonRole = new iam.Role(this, 'CustomLambdaCommonRole', {
      roleName: namingHelper.getIamRoleName('CustomLambdaCommon'),
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Custom role for general Lambda functions',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AWSLambda_ReadOnlyAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole'),
        customLambdaLoggingPolicy,
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSQSFullAccess')
      ]
    });

    // Custom Scheduler Lambda Execution Role
    this.customSchedulerLambdaExecutionRole = new iam.Role(this, 'CustomSchedulerLambdaExecutionRole', {
      roleName: namingHelper.getIamRoleName('CustomSchedulerLambdaExecutionRole'),
      assumedBy: new iam.ServicePrincipal('scheduler.amazonaws.com'),
      description: 'Custom role for EventBridge Scheduler to execute Lambda functions',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaRole')
      ]
    });

    // Apply tags to all resources
    taggingHelper.applyTags(this, {
      StackName: 'IamStack',
      Purpose: 'IAM roles and policies for serverless infrastructure'
    });

    // Outputs
    new cdk.CfnOutput(this, 'CustomLambdaLoggingRoleArn', {
      value: this.customLambdaLoggingRole.roleArn,
      description: 'ARN of the Custom Lambda Logging Role'
    });

    new cdk.CfnOutput(this, 'CustomApiGatewayLogRoleArn', {
      value: this.customApiGatewayLogRole.roleArn,
      description: 'ARN of the Custom API Gateway Log Role'
    });

    new cdk.CfnOutput(this, 'CustomLambdaEdgeS3RoleArn', {
      value: this.customLambdaEdgeS3Role.roleArn,
      description: 'ARN of the Custom Lambda Edge S3 Role'
    });

    new cdk.CfnOutput(this, 'CustomLambdaCommonRoleArn', {
      value: this.customLambdaCommonRole.roleArn,
      description: 'ARN of the Custom Lambda Common Role'
    });

    new cdk.CfnOutput(this, 'CustomSchedulerLambdaExecutionRoleArn', {
      value: this.customSchedulerLambdaExecutionRole.roleArn,
      description: 'ARN of the Custom Scheduler Lambda Execution Role'
    });
  }
}