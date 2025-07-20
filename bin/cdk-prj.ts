#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { getEnvironmentConfig } from '../lib/utils/environment';
import { NamingHelper } from '../lib/utils/naming';
import { createTaggingHelper } from '../lib/utils/tags';
import { STACK_NAMES } from '../lib/utils/constants';

// Import all stacks
import { IamStack } from '../lib/stacks/iam-stack';
import { VpcStack } from '../lib/stacks/vpc-stack';
import { SecurityGroupStack } from '../lib/stacks/security-group-stack';
import { S3Stack } from '../lib/stacks/s3-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { Ec2Stack } from '../lib/stacks/ec2-stack';
import { LambdaStack } from '../lib/stacks/lambda-stack';
import { ApiGatewayStack } from '../lib/stacks/api-gateway-stack';

const app = new cdk.App();

// Get environment configuration
const config = getEnvironmentConfig(app);
const namingHelper = new NamingHelper(config.stage);
const taggingHelper = createTaggingHelper(config.stage);

console.log(`Deploying to ${config.stage} environment`);
console.log(`Region: ${config.environment.region}`);
console.log(`Account: ${config.environment.account}`);

// Stack properties
const stackProps: cdk.StackProps = {
  env: config.environment,
  description: `${config.stage} environment stack for serverless backend infrastructure`,
  terminationProtection: config.isProd
};

// Create IAM Stack (must be first)
const iamStack = new IamStack(app, namingHelper.getStackName(STACK_NAMES.IAM), {
  ...stackProps,
  config,
  namingHelper,
  taggingHelper
});

// Create VPC Stack
const vpcStack = new VpcStack(app, namingHelper.getStackName(STACK_NAMES.VPC), {
  ...stackProps,
  config,
  namingHelper,
  taggingHelper
});

// Create Security Group Stack
const securityGroupStack = new SecurityGroupStack(app, namingHelper.getStackName(STACK_NAMES.SECURITY_GROUP), {
  ...stackProps,
  config,
  namingHelper,
  taggingHelper,
  vpc: vpcStack.vpc
});

// Create S3 Stack
const s3Stack = new S3Stack(app, namingHelper.getStackName(STACK_NAMES.S3), {
  ...stackProps,
  config,
  namingHelper,
  taggingHelper
});

// Create Database Stack
const databaseStack = new DatabaseStack(app, namingHelper.getStackName(STACK_NAMES.DATABASE), {
  ...stackProps,
  config,
  namingHelper,
  taggingHelper,
  vpc: vpcStack.vpc,
  databaseSecurityGroups: [
    securityGroupStack.dbSshGroup,
    securityGroupStack.dbPrivateGroup
  ]
});

// Create EC2 Stack
const ec2Stack = new Ec2Stack(app, namingHelper.getStackName(STACK_NAMES.EC2), {
  ...stackProps,
  config,
  namingHelper,
  taggingHelper,
  vpc: vpcStack.vpc,
  publicSshSecurityGroup: securityGroupStack.publicSshGroup,
  bastionOutboundSecurityGroup: securityGroupStack.bastionOutboundGroup,
  natSecurityGroup: securityGroupStack.natGroup
});

// Create Lambda Stack
const lambdaStack = new LambdaStack(app, namingHelper.getStackName(STACK_NAMES.LAMBDA), {
  ...stackProps,
  config,
  namingHelper,
  taggingHelper,
  vpc: vpcStack.vpc,
  lambdaSecurityGroup: securityGroupStack.lambdaOutboundGroup,
  lambdaRole: iamStack.customLambdaCommonRole
});

// Create API Gateway Stack
const apiGatewayStack = new ApiGatewayStack(app, namingHelper.getStackName(STACK_NAMES.API_GATEWAY), {
  ...stackProps,
  config,
  namingHelper,
  taggingHelper,
  healthCheckFunction: lambdaStack.healthCheckFunction,
  apiGatewayRole: iamStack.customApiGatewayLogRole
});

// Set up dependencies
securityGroupStack.addDependency(vpcStack);
databaseStack.addDependency(securityGroupStack);
ec2Stack.addDependency(securityGroupStack);
lambdaStack.addDependency(securityGroupStack);
lambdaStack.addDependency(iamStack);
apiGatewayStack.addDependency(lambdaStack);
apiGatewayStack.addDependency(iamStack);

// Apply tags to the entire app
taggingHelper.applyTags(app, {
  Application: 'Serverless Backend',
  Version: '1.0.0',
  Repository: 'cdk-prj'
});

// Synthesize the app
app.synth();